/** cSpell:ignore nocheck, Labelledby, vscomp, tabindex, combobox, haspopup, listbox, activedescendant */
/* eslint-disable class-methods-use-this */
// @ts-nocheck
import { Utils, DomUtils } from './utils';

const dropboxCloseButtonFullHeight = 48;
const searchHeight = 40;

const keyDownMethodMapping = {
  13: 'onEnterPress',
  38: 'onUpArrowPress',
  40: 'onDownArrowPress',
};

const valueLessProps = ['autofocus', 'disabled', 'multiple', 'required'];
const nativeProps = ['autofocus', 'class', 'disabled', 'id', 'multiple', 'name', 'placeholder', 'required'];
let attrPropsMapping;

const dataProps = [
  'additionalClasses',
  'aliasKey',
  'allOptionsSelectedText',
  'allowNewOption',
  'alwaysShowSelectedOptionsCount',
  'alwaysShowSelectedOptionsLabel',
  'ariaLabelledby',
  'autoSelectFirstOption',
  'clearButtonText',
  'descriptionKey',
  'disableAllOptionsSelectedText',
  'disableOptionGroupCheckbox',
  'disableSelectAll',
  'disableValidation',
  'dropboxWidth',
  'dropboxWrapper',
  'emptyValue',
  'enableSecureText',
  'focusSelectedOptionOnOpen',
  'hasOptionDescription',
  'hideClearButton',
  'hideValueTooltipOnSelectAll',
  'keepAlwaysOpen',
  'labelKey',
  'markSearchResults',
  'maxValues',
  'maxWidth',
  'minValues',
  'moreText',
  'noOfDisplayValues',
  'noOptionsText',
  'noSearchResultsText',
  'optionHeight',
  'optionSelectedText',
  'optionsCount',
  'optionsSelectedText',
  'popupDropboxBreakpoint',
  'popupPosition',
  'position',
  'search',
  'searchByStartsWith',
  'searchDelay',
  'searchGroup',
  'searchPlaceholderText',
  'selectAllOnlyVisible',
  'selectAllText',
  'setValueAsArray',
  'showDropboxAsPopup',
  'showOptionsOnlyOnSearch',
  'showSelectedOptionsFirst',
  'showValueAsTags',
  'silentInitialValueSet',
  'textDirection',
  'tooltipAlignment',
  'tooltipFontSize',
  'tooltipMaxWidth',
  'updatePositionThrottle',
  'useGroupValue',
  'valueKey',
  'zIndex',
];

/** Class representing VirtualSelect */
export class VirtualSelect {
  /**
   * @param {virtualSelectOptions} options
   */
  constructor(options) {
    try {
      this.createSecureTextElements();
      this.setProps(options);
      this.setDisabledOptions(options.disabledOptions);
      this.setOptions(options.options);
      this.render();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Couldn't initiate Virtual Select");
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  /** render methods - start */
  render() {
    if (!this.$ele) {
      return;
    }

    const { uniqueId } = this;
    let wrapperClasses = 'vscomp-wrapper';
    const valueTooltip = this.getTooltipAttrText(this.placeholder, true, true);
    const clearButtonTooltip = this.getTooltipAttrText(this.clearButtonText);
    const ariaLabelledbyText = this.ariaLabelledby ? `aria-labelledby="${this.ariaLabelledby}"` : '';
    let isExpanded = false;

    if (this.additionalClasses) {
      wrapperClasses += ` ${this.additionalClasses}`;
    }

    if (this.multiple) {
      wrapperClasses += ' multiple';

      if (!this.disableSelectAll) {
        wrapperClasses += ' has-select-all';
      }
    }

    if (!this.hideClearButton) {
      wrapperClasses += ' has-clear-button';
    }

    if (this.keepAlwaysOpen) {
      wrapperClasses += ' keep-always-open';
      isExpanded = true;
    } else {
      wrapperClasses += ' closed';
    }

    if (this.showAsPopup) {
      wrapperClasses += ' show-as-popup';
    }

    if (this.hasSearch) {
      wrapperClasses += ' has-search-input';
    }

    if (this.showValueAsTags) {
      wrapperClasses += ' show-value-as-tags';
    }

    if (this.textDirection) {
      wrapperClasses += ` text-direction-${this.textDirection}`;
    }

    if (this.popupPosition) {
      wrapperClasses += ` popup-position-${this.popupPosition.toLowerCase()}`;
    }

    const html = `<div id="vscomp-ele-wrapper-${uniqueId}" class="vscomp-ele-wrapper ${wrapperClasses}" tabindex="0"
        role="combobox" aria-haspopup="listbox" aria-controls="vscomp-dropbox-container-${uniqueId}"
        aria-expanded="${isExpanded}" ${ariaLabelledbyText}
      >
        <input type="hidden" name="${this.name}" class="vscomp-hidden-input">

        <div class="vscomp-toggle-button">
          <div class="vscomp-value" ${valueTooltip}>
            ${this.placeholder}
          </div>

          <div class="vscomp-arrow"></div>

          <div class="vscomp-clear-button toggle-button-child" ${clearButtonTooltip}>
            <i class="vscomp-clear-icon"></i>
          </div>
        </div>

        ${this.renderDropbox({ wrapperClasses })}
      </div>`;

    this.$ele.innerHTML = html;
    this.$body = document.querySelector('body');
    this.$wrapper = this.$ele.querySelector('.vscomp-wrapper');

    if (this.hasDropboxWrapper) {
      this.$allWrappers = [this.$wrapper, this.$dropboxWrapper];
      this.$dropboxContainer = this.$dropboxWrapper.querySelector('.vscomp-dropbox-container');

      DomUtils.addClass(this.$dropboxContainer, 'pop-comp-wrapper');
    } else {
      this.$allWrappers = [this.$wrapper];
      this.$dropboxContainer = this.$wrapper.querySelector('.vscomp-dropbox-container');
    }

    this.$toggleButton = this.$ele.querySelector('.vscomp-toggle-button');
    this.$clearButton = this.$ele.querySelector('.vscomp-clear-button');
    this.$valueText = this.$ele.querySelector('.vscomp-value');
    this.$hiddenInput = this.$ele.querySelector('.vscomp-hidden-input');
    this.$dropbox = this.$dropboxContainer.querySelector('.vscomp-dropbox');
    this.$dropboxCloseButton = this.$dropboxContainer.querySelector('.vscomp-dropbox-close-button');
    this.$search = this.$dropboxContainer.querySelector('.vscomp-search-wrapper');
    this.$optionsContainer = this.$dropboxContainer.querySelector('.vscomp-options-container');
    this.$optionsList = this.$dropboxContainer.querySelector('.vscomp-options-list');
    this.$options = this.$dropboxContainer.querySelector('.vscomp-options');
    this.$noOptions = this.$dropboxContainer.querySelector('.vscomp-no-options');
    this.$noSearchResults = this.$dropboxContainer.querySelector('.vscomp-no-search-results');

    this.afterRenderWrapper();
  }

  renderDropbox({ wrapperClasses }) {
    const $wrapper = this.dropboxWrapper !== 'self' ? document.querySelector(this.dropboxWrapper) : null;

    const html = `<div id="vscomp-dropbox-container-${this.uniqueId}" role="listbox" class="vscomp-dropbox-container">
        <div class="vscomp-dropbox">
          <div class="vscomp-search-wrapper"></div>

          <div class="vscomp-options-container">
            <div class="vscomp-options-loader"></div>

            <div class="vscomp-options-list">
              <div class="vscomp-options"></div>
            </div>
          </div>

          <div class="vscomp-options-bottom-freezer"></div>
          <div class="vscomp-no-options">${this.noOptionsText}</div>
          <div class="vscomp-no-search-results">${this.noSearchResultsText}</div>

          <span class="vscomp-dropbox-close-button"><i class="vscomp-clear-icon"></i></span>
        </div>
      </div>`;

    if ($wrapper) {
      const $dropboxWrapper = document.createElement('div');
      this.$dropboxWrapper = $dropboxWrapper;
      this.hasDropboxWrapper = true;
      $dropboxWrapper.innerHTML = html;

      $wrapper.appendChild($dropboxWrapper);
      DomUtils.addClass($dropboxWrapper, `vscomp-dropbox-wrapper ${wrapperClasses}`);

      return '';
    }

    this.hasDropboxWrapper = false;

    return html;
  }

  renderOptions() {
    let html = '';
    const visibleOptions = this.getVisibleOptions();
    let checkboxHtml = '';
    let newOptionIconHtml = '';
    const markSearchResults = !!(this.markSearchResults && this.searchValue);
    let searchRegex;
    const { labelRenderer, disableOptionGroupCheckbox, uniqueId, searchGroup } = this;
    const hasLabelRenderer = typeof labelRenderer === 'function';
    const { convertToBoolean } = Utils;

    if (markSearchResults) {
      searchRegex = new RegExp(`(${Utils.regexEscape(this.searchValue)})`, 'gi');
    }

    if (this.multiple) {
      checkboxHtml = '<span class="checkbox-icon"></span>';
    }

    if (this.allowNewOption) {
      const newOptionTooltip = this.getTooltipAttrText('New Option');
      newOptionIconHtml = `<span class="vscomp-new-option-icon" ${newOptionTooltip}></span>`;
    }

    visibleOptions.forEach((d) => {
      const { index } = d;
      let optionLabel;
      let optionClasses = 'vscomp-option';
      const optionTooltip = this.getTooltipAttrText('', true, true);
      let leftSection = checkboxHtml;
      let rightSection = '';
      let description = '';
      let groupIndexText = '';
      const isSelected = convertToBoolean(d.isSelected);
      let ariaDisabledText = '';

      if (d.classNames) {
        optionClasses += ` ${d.classNames}`;
      }

      if (d.isFocused) {
        optionClasses += ' focused';
      }

      if (d.isDisabled) {
        optionClasses += ' disabled';
        ariaDisabledText = 'aria-disabled="true"';
      }

      if (d.isGroupTitle) {
        optionClasses += ' group-title';

        if (disableOptionGroupCheckbox) {
          leftSection = '';
        }
      }

      if (isSelected) {
        optionClasses += ' selected';
      }

      if (d.isGroupOption) {
        optionClasses += ' group-option';
        groupIndexText = `data-group-index="${d.groupIndex}"`;
      }

      if (hasLabelRenderer) {
        optionLabel = labelRenderer(d);
      } else {
        optionLabel = d.label;
      }

      if (d.description) {
        description = `<div class="vscomp-option-description" ${optionTooltip}>${d.description}</div>`;
      }

      if (d.isCurrentNew) {
        optionClasses += ' current-new';
        rightSection += newOptionIconHtml;
      } else if (markSearchResults && (!d.isGroupTitle || searchGroup)) {
        optionLabel = optionLabel.replace(searchRegex, '<mark>$1</mark>');
      }

      html += `<div role="option" aria-selected="${isSelected}" id="vscomp-option-${uniqueId}-${index}"
          class="${optionClasses}" data-value="${d.value}" data-index="${index}" data-visible-index="${d.visibleIndex}"
          ${groupIndexText} ${ariaDisabledText}
        >
          ${leftSection}
          <span class="vscomp-option-text" ${optionTooltip}>
            ${optionLabel}
          </span>
          ${description}
          ${rightSection}
        </div>`;
    });

    this.$options.innerHTML = html;
    this.$visibleOptions = this.$options.querySelectorAll('.vscomp-option');

    this.afterRenderOptions();
  }

  renderSearch() {
    if (!this.hasSearchContainer) {
      return;
    }

    let checkboxHtml = '';
    let searchInput = '';

    if (this.multiple && !this.disableSelectAll) {
      checkboxHtml = `<span class="vscomp-toggle-all-button">
          <span class="checkbox-icon vscomp-toggle-all-checkbox"></span>
          <span class="vscomp-toggle-all-label">${this.selectAllText}</span>
        </span>`;
    }

    if (this.hasSearch) {
      searchInput = `<input type="text" class="vscomp-search-input" placeholder="${this.searchPlaceholderText}">
      <span class="vscomp-search-clear">&times;</span>`;
    }

    const html = `<div class="vscomp-search-container">
        ${checkboxHtml}
        ${searchInput}
      </div>`;

    this.$search.innerHTML = html;
    this.$searchInput = this.$dropboxContainer.querySelector('.vscomp-search-input');
    this.$searchClear = this.$dropboxContainer.querySelector('.vscomp-search-clear');
    this.$toggleAllButton = this.$dropboxContainer.querySelector('.vscomp-toggle-all-button');
    this.$toggleAllCheckbox = this.$dropboxContainer.querySelector('.vscomp-toggle-all-checkbox');

    this.addEvent(this.$searchInput, 'input', 'onSearch');
    this.addEvent(this.$searchClear, 'click', 'onSearchClear');
    this.addEvent(this.$toggleAllButton, 'click', 'onToggleAllOptions');
  }
  /** render methods - end */

  /** dom event methods - start */
  addEvents() {
    this.addEvent(document, 'click', 'onDocumentClick');
    this.addEvent(this.$allWrappers, 'keydown', 'onKeyDown');
    this.addEvent(this.$toggleButton, 'click', 'onToggleButtonClick');
    this.addEvent(this.$clearButton, 'click', 'onClearButtonClick');
    this.addEvent(this.$dropboxContainer, 'click', 'onDropboxContainerClick');
    this.addEvent(this.$dropboxCloseButton, 'click', 'onDropboxCloseButtonClick');
    this.addEvent(this.$optionsContainer, 'scroll', 'onOptionsScroll');
    this.addEvent(this.$options, 'click', 'onOptionsClick');
    this.addEvent(this.$options, 'mouseover', 'onOptionsMouseOver');
    this.addEvent(this.$options, 'touchmove', 'onOptionsTouchMove');
    this.addMutationObserver();
  }

  addEvent($ele, events, method) {
    if (!$ele) {
      return;
    }

    const eventsArray = Utils.removeArrayEmpty(events.split(' '));

    eventsArray.forEach((event) => {
      const eventsKey = `${method}-${event}`;
      let callback = this.events[eventsKey];

      if (!callback) {
        callback = this[method].bind(this);
        this.events[eventsKey] = callback;
      }

      DomUtils.addEvent($ele, event, callback);
    });
  }

  onDocumentClick(e) {
    const $eleToKeepOpen = e.target.closest('.vscomp-wrapper');

    if ($eleToKeepOpen !== this.$wrapper && $eleToKeepOpen !== this.$dropboxWrapper && this.isOpened()) {
      this.closeDropbox();
    }
  }

  onKeyDown(e) {
    const key = e.which || e.keyCode;
    const method = keyDownMethodMapping[key];

    if (method) {
      this[method](e);
    }
  }

  onEnterPress(e) {
    e.preventDefault();

    if (this.isOpened()) {
      this.selectFocusedOption();
    } else {
      this.openDropbox();
    }
  }

  onDownArrowPress(e) {
    e.preventDefault();

    if (this.isOpened()) {
      this.focusOption({ direction: 'next' });
    } else {
      this.openDropbox();
    }
  }

  onUpArrowPress(e) {
    e.preventDefault();

    if (this.isOpened()) {
      this.focusOption({ direction: 'previous' });
    } else {
      this.openDropbox();
    }
  }

  onToggleButtonClick(e) {
    const $target = e.target;

    if ($target.closest('.vscomp-value-tag-clear-button')) {
      this.removeValue($target.closest('.vscomp-value-tag'));
    } else if (!$target.closest('.toggle-button-child')) {
      this.toggleDropbox();
    }
  }

  onClearButtonClick() {
    this.reset();
  }

  onOptionsScroll() {
    this.setVisibleOptions();
  }

  onOptionsClick(e) {
    const $option = e.target.closest('.vscomp-option');

    if ($option && !DomUtils.hasClass($option, 'disabled')) {
      if (DomUtils.hasClass($option, 'group-title')) {
        this.onGroupTitleClick($option);
      } else {
        this.selectOption($option, { event: e });
      }
    }
  }

  onGroupTitleClick($ele) {
    if (!$ele || !this.multiple || this.disableOptionGroupCheckbox) {
      return;
    }

    const isAdding = !DomUtils.hasClass($ele, 'selected');

    this.toggleGroupTitleCheckbox($ele, isAdding);
    this.toggleGroupOptions($ele, isAdding);
  }

  onDropboxContainerClick(e) {
    if (!e.target.closest('.vscomp-dropbox')) {
      this.closeDropbox();
    }
  }

  onDropboxCloseButtonClick() {
    this.closeDropbox();
  }

  onOptionsMouseOver(e) {
    const $ele = e.target.closest('.vscomp-option');

    if ($ele && this.isOpened()) {
      if (DomUtils.hasClass($ele, 'disabled') || DomUtils.hasClass($ele, 'group-title')) {
        this.removeOptionFocus();
      } else {
        this.focusOption({ $option: $ele });
      }
    }
  }

  onOptionsTouchMove() {
    this.removeOptionFocus();
  }

  onSearch(e) {
    e.stopPropagation();
    this.setSearchValue(e.target.value, true);
  }

  onSearchClear() {
    this.setSearchValue('');
    this.focusSearchInput();
  }

  onToggleAllOptions() {
    this.toggleAllOptions();
  }

  onResize() {
    this.setOptionsContainerHeight(true);
  }

  /** to remove dropboxWrapper on removing vscomp-ele when it is rendered outside of vscomp-ele */
  addMutationObserver() {
    if (!this.hasDropboxWrapper) {
      return;
    }

    const $vscompEle = this.$ele;

    this.mutationObserver = new MutationObserver((mutations) => {
      let isAdded = false;
      let isRemoved = false;

      mutations.forEach((mutation) => {
        if (!isAdded) {
          isAdded = [...mutation.addedNodes].some(($ele) => !!($ele === $vscompEle || $ele.contains($vscompEle)));
        }

        if (!isRemoved) {
          isRemoved = [...mutation.removedNodes].some(($ele) => !!($ele === $vscompEle || $ele.contains($vscompEle)));
        }
      });

      if (isRemoved && !isAdded) {
        this.destroy();
      }
    });

    this.mutationObserver.observe(document.querySelector('body'), { childList: true, subtree: true });
  }
  /** dom event methods - end */

  /** before event methods - start */
  beforeValueSet(isReset) {
    this.toggleAllOptionsClass(isReset ? false : undefined);
  }

  beforeSelectNewValue() {
    const newOption = this.getNewOption();
    const newIndex = newOption.index;

    this.newValues.push(newOption.value);
    this.setOptionProp(newIndex, 'isCurrentNew', false);
    this.setOptionProp(newIndex, 'isNew', true);

    /** using setTimeout to fix the issue of dropbox getting closed on select */
    setTimeout(() => {
      this.setSearchValue('');
      this.focusSearchInput();
    }, 0);
  }
  /** before event methods - end */

  /** after event methods - start */
  afterRenderWrapper() {
    DomUtils.addClass(this.$ele, 'vscomp-ele');

    this.renderSearch();
    this.setEleStyles();
    this.setDropboxStyles();
    this.setOptionsHeight();
    this.setVisibleOptions();
    this.setOptionsContainerHeight();
    this.addEvents();
    this.setEleProps();

    if (!this.keepAlwaysOpen && !this.showAsPopup) {
      this.initDropboxPopover();
    }

    if (this.initialSelectedValue) {
      this.setValueMethod(this.initialSelectedValue, this.silentInitialValueSet);
    } else if (this.autoSelectFirstOption && this.visibleOptions.length) {
      this.setValueMethod(this.visibleOptions[0].value, this.silentInitialValueSet);
    }

    if (this.showOptionsOnlyOnSearch) {
      this.setSearchValue('', false, true);
    }

    if (this.initialDisabled) {
      this.disable();
    }

    if (this.autofocus) {
      this.focus();
    }
  }

  afterRenderOptions() {
    const visibleOptions = this.getVisibleOptions();
    const hasNoOptions = !this.options.length && !this.hasServerSearch;
    const hasNoSearchResults = !hasNoOptions && !visibleOptions.length;

    if (!this.allowNewOption || this.hasServerSearch || this.showOptionsOnlyOnSearch) {
      DomUtils.toggleClass(this.$allWrappers, 'has-no-search-results', hasNoSearchResults);
    }

    DomUtils.toggleClass(this.$allWrappers, 'has-no-options', hasNoOptions);

    this.setOptionAttr();
    this.setOptionsPosition();
    this.setOptionsTooltip();
  }

  afterSetOptionsContainerHeight(reset) {
    if (reset && this.showAsPopup) {
      this.setVisibleOptions();
    }
  }

  afterSetSearchValue() {
    if (this.hasServerSearch) {
      clearInterval(this.serverSearchTimeout);

      this.serverSearchTimeout = setTimeout(() => {
        this.serverSearch();
      }, this.searchDelay);
    } else {
      this.setVisibleOptionsCount();
    }

    if (this.selectAllOnlyVisible) {
      this.toggleAllOptionsClass();
    }

    this.focusOption({ focusFirst: true });
  }

  afterSetVisibleOptionsCount() {
    this.scrollToTop();
    this.setOptionsHeight();
    this.setVisibleOptions();
    this.updatePosition();
  }

  afterValueSet() {
    this.scrollToTop();
    this.setSearchValue('');
    this.renderOptions();
  }

  afterSetOptions(keepValue) {
    if (keepValue) {
      this.setSelectedProp();
    }

    this.setOptionsHeight();
    this.setVisibleOptions();

    if (this.showOptionsOnlyOnSearch) {
      this.setSearchValue('', false, true);
    }

    if (!keepValue) {
      this.reset();
    }
  }
  /** after event methods - end */

  /** set methods - start */
  /**
   * @param {virtualSelectOptions} params
   */
  setProps(params) {
    const options = this.setDefaultProps(params);
    this.setPropsFromElementAttr(options);

    const { convertToBoolean } = Utils;

    this.$ele = options.ele;
    this.dropboxWrapper = options.dropboxWrapper;
    this.valueKey = options.valueKey;
    this.labelKey = options.labelKey;
    this.descriptionKey = options.descriptionKey;
    this.aliasKey = options.aliasKey;
    this.optionHeightText = options.optionHeight;
    this.optionHeight = parseFloat(this.optionHeightText);
    this.multiple = convertToBoolean(options.multiple);
    this.hasSearch = convertToBoolean(options.search);
    this.searchByStartsWith = convertToBoolean(options.searchByStartsWith);
    this.searchGroup = convertToBoolean(options.searchGroup);
    this.hideClearButton = convertToBoolean(options.hideClearButton);
    this.autoSelectFirstOption = convertToBoolean(options.autoSelectFirstOption);
    this.hasOptionDescription = convertToBoolean(options.hasOptionDescription);
    this.silentInitialValueSet = convertToBoolean(options.silentInitialValueSet);
    this.allowNewOption = convertToBoolean(options.allowNewOption);
    this.markSearchResults = convertToBoolean(options.markSearchResults);
    this.showSelectedOptionsFirst = convertToBoolean(options.showSelectedOptionsFirst);
    this.disableSelectAll = convertToBoolean(options.disableSelectAll);
    this.keepAlwaysOpen = convertToBoolean(options.keepAlwaysOpen);
    this.showDropboxAsPopup = convertToBoolean(options.showDropboxAsPopup);
    this.hideValueTooltipOnSelectAll = convertToBoolean(options.hideValueTooltipOnSelectAll);
    this.showOptionsOnlyOnSearch = convertToBoolean(options.showOptionsOnlyOnSearch);
    this.selectAllOnlyVisible = convertToBoolean(options.selectAllOnlyVisible);
    this.alwaysShowSelectedOptionsCount = convertToBoolean(options.alwaysShowSelectedOptionsCount);
    this.alwaysShowSelectedOptionsLabel = convertToBoolean(options.alwaysShowSelectedOptionsLabel);
    this.disableAllOptionsSelectedText = convertToBoolean(options.disableAllOptionsSelectedText);
    this.showValueAsTags = convertToBoolean(options.showValueAsTags);
    this.disableOptionGroupCheckbox = convertToBoolean(options.disableOptionGroupCheckbox);
    this.enableSecureText = convertToBoolean(options.enableSecureText);
    this.setValueAsArray = convertToBoolean(options.setValueAsArray);
    this.disableValidation = convertToBoolean(options.disableValidation);
    this.initialDisabled = convertToBoolean(options.disabled);
    this.required = convertToBoolean(options.required);
    this.autofocus = convertToBoolean(options.autofocus);
    this.useGroupValue = convertToBoolean(options.useGroupValue);
    this.focusSelectedOptionOnOpen = convertToBoolean(options.focusSelectedOptionOnOpen);
    this.noOptionsText = options.noOptionsText;
    this.noSearchResultsText = options.noSearchResultsText;
    this.selectAllText = options.selectAllText;
    this.searchPlaceholderText = options.searchPlaceholderText;
    this.optionsSelectedText = options.optionsSelectedText;
    this.optionSelectedText = options.optionSelectedText;
    this.allOptionsSelectedText = options.allOptionsSelectedText;
    this.clearButtonText = options.clearButtonText;
    this.moreText = options.moreText;
    this.placeholder = options.placeholder;
    this.position = options.position;
    this.textDirection = options.textDirection;
    this.dropboxWidth = options.dropboxWidth;
    this.tooltipFontSize = options.tooltipFontSize;
    this.tooltipAlignment = options.tooltipAlignment;
    this.tooltipMaxWidth = options.tooltipMaxWidth;
    this.updatePositionThrottle = options.updatePositionThrottle;
    this.noOfDisplayValues = parseInt(options.noOfDisplayValues);
    this.zIndex = parseInt(options.zIndex);
    this.maxValues = parseInt(options.maxValues);
    this.minValues = parseInt(options.minValues);
    this.name = this.secureText(options.name);
    this.additionalClasses = options.additionalClasses;
    this.popupDropboxBreakpoint = options.popupDropboxBreakpoint;
    this.popupPosition = options.popupPosition;
    this.onServerSearch = options.onServerSearch;
    this.labelRenderer = options.labelRenderer;
    this.initialSelectedValue = options.selectedValue === 0 ? '0' : options.selectedValue;
    this.emptyValue = options.emptyValue;
    this.ariaLabelledby = options.ariaLabelledby;
    this.maxWidth = options.maxWidth;
    this.searchDelay = options.searchDelay;

    /** @type {string[]} */
    this.selectedValues = [];
    /** @type {virtualSelectOption[]} */
    this.selectedOptions = [];
    this.newValues = [];
    this.events = {};
    this.tooltipEnterDelay = 200;
    this.searchValue = '';
    this.searchValueOriginal = '';
    this.isAllSelected = false;

    if ((options.search === undefined && this.multiple) || this.allowNewOption || this.showOptionsOnlyOnSearch) {
      this.hasSearch = true;
    }

    this.hasServerSearch = typeof this.onServerSearch === 'function';

    if (this.maxValues || this.hasServerSearch || this.showOptionsOnlyOnSearch) {
      this.disableSelectAll = true;
      this.disableOptionGroupCheckbox = true;
    }

    if (this.keepAlwaysOpen) {
      this.dropboxWrapper = 'self';
    }

    this.showAsPopup =
      this.showDropboxAsPopup && !this.keepAlwaysOpen && window.innerWidth <= parseFloat(this.popupDropboxBreakpoint);
    this.hasSearchContainer = this.hasSearch || (this.multiple && !this.disableSelectAll);
    this.optionsCount = this.getOptionsCount(options.optionsCount);
    this.halfOptionsCount = Math.ceil(this.optionsCount / 2);
    this.optionsHeight = this.getOptionsHeight();
    this.uniqueId = this.getUniqueId();
  }

  /**
   * @param {virtualSelectOptions} options
   */
  setDefaultProps(options) {
    const defaultOptions = {
      dropboxWrapper: 'self',
      valueKey: 'value',
      labelKey: 'label',
      descriptionKey: 'description',
      aliasKey: 'alias',
      optionsCount: 5,
      noOfDisplayValues: 50,
      optionHeight: '40px',
      noOptionsText: 'No options found',
      noSearchResultsText: 'No results found',
      selectAllText: 'Select All',
      searchPlaceholderText: 'Search...',
      clearButtonText: 'Clear',
      moreText: 'more...',
      optionsSelectedText: 'options selected',
      optionSelectedText: 'option selected',
      allOptionsSelectedText: 'All',
      placeholder: 'Select',
      position: 'bottom left',
      zIndex: options.keepAlwaysOpen ? 1 : 2,
      tooltipFontSize: '14px',
      tooltipAlignment: 'center',
      tooltipMaxWidth: '300px',
      updatePositionThrottle: 100,
      name: '',
      additionalClasses: '',
      maxValues: 0,
      showDropboxAsPopup: true,
      popupDropboxBreakpoint: '576px',
      popupPosition: 'center',
      hideValueTooltipOnSelectAll: true,
      emptyValue: '',
      searchDelay: 300,
      focusSelectedOptionOnOpen: true,
    };

    if (options.hasOptionDescription) {
      defaultOptions.optionsCount = 4;
      defaultOptions.optionHeight = '50px';
    }

    return Object.assign(defaultOptions, options);
  }

  setPropsFromElementAttr(options) {
    const $ele = options.ele;

    Object.keys(attrPropsMapping).forEach((k) => {
      let value = $ele.getAttribute(k);

      if (valueLessProps.indexOf(k) !== -1 && (value === '' || value === 'true')) {
        value = true;
      }

      if (value) {
        // eslint-disable-next-line no-param-reassign
        options[attrPropsMapping[k]] = value;
      }
    });
  }

  setEleProps() {
    const { $ele } = this;
    $ele.virtualSelect = this;
    $ele.value = this.multiple ? [] : '';
    $ele.name = this.name;
    $ele.disabled = false;
    $ele.required = this.required;
    $ele.autofocus = this.autofocus;
    $ele.multiple = this.multiple;
    $ele.form = $ele.closest('form');

    $ele.reset = VirtualSelect.reset;
    $ele.setValue = VirtualSelect.setValueMethod;
    $ele.setOptions = VirtualSelect.setOptionsMethod;
    $ele.setDisabledOptions = VirtualSelect.setDisabledOptionsMethod;
    $ele.setEnabledOptions = VirtualSelect.setEnabledOptionsMethod;
    $ele.toggleSelectAll = VirtualSelect.toggleSelectAll;
    $ele.isAllSelected = VirtualSelect.isAllSelected;
    $ele.addOption = VirtualSelect.addOptionMethod;
    $ele.getNewValue = VirtualSelect.getNewValueMethod;
    $ele.getDisplayValue = VirtualSelect.getDisplayValueMethod;
    $ele.getSelectedOptions = VirtualSelect.getSelectedOptionsMethod;
    $ele.getDisabledOptions = VirtualSelect.getDisabledOptionsMethod;
    $ele.open = VirtualSelect.openMethod;
    $ele.close = VirtualSelect.closeMethod;
    $ele.focus = VirtualSelect.focusMethod;
    $ele.enable = VirtualSelect.enableMethod;
    $ele.disable = VirtualSelect.disableMethod;
    $ele.destroy = VirtualSelect.destroyMethod;
    $ele.validate = VirtualSelect.validateMethod;
    $ele.toggleRequired = VirtualSelect.toggleRequiredMethod;

    if (this.hasDropboxWrapper) {
      this.$dropboxWrapper.virtualSelect = this;
    }
  }

  setValueMethod(newValue, silentChange) {
    const valuesMapping = {};
    const valuesOrder = {};
    let validValues = [];
    const isMultiSelect = this.multiple;
    let value = newValue;

    if (value) {
      if (!Array.isArray(value)) {
        value = [value];
      }

      if (isMultiSelect) {
        const { maxValues } = this;

        if (maxValues && value.length > maxValues) {
          value.splice(maxValues);
        }
      } else if (value.length > 1) {
        value = [value[0]];
      }

      /** converting value to string */
      value = value.map((v) => (v || v === 0 ? v.toString() : ''));

      if (this.useGroupValue) {
        value = this.setGroupOptionsValue(value);
      }

      value.forEach((d, i) => {
        valuesMapping[d] = true;
        valuesOrder[d] = i;
      });

      if (this.allowNewOption && value) {
        this.setNewOptionsFromValue(value);
      }
    }

    this.options.forEach((d) => {
      if (valuesMapping[d.value] === true && !d.isDisabled && !d.isGroupTitle) {
        // eslint-disable-next-line no-param-reassign
        d.isSelected = true;
        validValues.push(d.value);
      } else {
        // eslint-disable-next-line no-param-reassign
        d.isSelected = false;
      }
    });

    if (isMultiSelect) {
      if (this.hasOptionGroup) {
        this.setGroupsSelectedProp();
      }

      /** sorting validValues in the given values order */
      validValues.sort((a, b) => valuesOrder[a] - valuesOrder[b]);
    } else {
      /** taking first value for single select */
      [validValues] = validValues;
    }

    this.beforeValueSet();
    this.setValue(validValues, { disableEvent: silentChange });
    this.afterValueSet();
  }

  setGroupOptionsValue(preparedValues) {
    const selectedValues = [];
    const selectedGroups = {};
    const valuesMapping = {};

    preparedValues.forEach((d) => {
      valuesMapping[d] = true;
    });

    this.options.forEach((d) => {
      const { value } = d;
      const isSelected = valuesMapping[value] === true;

      if (d.isGroupTitle) {
        if (isSelected) {
          selectedGroups[d.index] = true;
        }
      } else if (isSelected || selectedGroups[d.groupIndex]) {
        selectedValues.push(value);
      }
    });

    return selectedValues;
  }

  setGroupsSelectedProp() {
    const isAllGroupOptionsSelected = this.isAllGroupOptionsSelected.bind(this);

    this.options.forEach((d) => {
      if (d.isGroupTitle) {
        // eslint-disable-next-line no-param-reassign
        d.isSelected = isAllGroupOptionsSelected(d.index);
      }
    });
  }

  setOptionsMethod(options, keepValue) {
    this.setOptions(options);
    this.afterSetOptions(keepValue);
  }

  setDisabledOptionsMethod(disabledOptions, keepValue = false) {
    this.setDisabledOptions(disabledOptions, true);

    if (!keepValue) {
      this.setValueMethod(null);
      this.toggleAllOptionsClass();
    }

    this.setVisibleOptions();
  }

  setDisabledOptions(disabledOptions, setOptionsProp = false) {
    let disabledOptionsArr = [];

    if (!disabledOptions) {
      if (setOptionsProp) {
        this.options.forEach((d) => {
          // eslint-disable-next-line no-param-reassign
          d.isDisabled = false;

          return d;
        });
      }
    } else if (disabledOptions === true) {
      if (setOptionsProp) {
        this.options.forEach((d) => {
          // eslint-disable-next-line no-param-reassign
          d.isDisabled = true;

          disabledOptionsArr.push(d.value);

          return d;
        });
      }
    } else {
      disabledOptionsArr = disabledOptions.map((d) => d.toString());
      const disabledOptionsMapping = {};

      disabledOptionsArr.forEach((d) => {
        disabledOptionsMapping[d] = true;
      });

      if (setOptionsProp) {
        this.options.forEach((d) => {
          // eslint-disable-next-line no-param-reassign
          d.isDisabled = disabledOptionsMapping[d.value] === true;

          return d;
        });
      }
    }

    this.disabledOptions = disabledOptionsArr;
  }

  setEnabledOptionsMethod(disabledOptions, keepValue = false) {
    this.setEnabledOptions(disabledOptions);

    if (!keepValue) {
      this.setValueMethod(null);
      this.toggleAllOptionsClass();
    }

    this.setVisibleOptions();
  }

  setEnabledOptions(enabledOptions) {
    if (enabledOptions === undefined) {
      return;
    }

    const disabledOptionsArr = [];

    if (enabledOptions === true) {
      this.options.forEach((d) => {
        // eslint-disable-next-line no-param-reassign
        d.isDisabled = false;

        return d;
      });
    } else {
      const enabledOptionsMapping = {};

      enabledOptions.forEach((d) => {
        enabledOptionsMapping[d] = true;
      });

      this.options.forEach((d) => {
        const isDisabled = enabledOptionsMapping[d.value] !== true;

        // eslint-disable-next-line no-param-reassign
        d.isDisabled = isDisabled;

        if (isDisabled) {
          disabledOptionsArr.push(d.value);
        }

        return d;
      });
    }

    this.disabledOptions = disabledOptionsArr;
  }

  setOptions(options = []) {
    const preparedOptions = [];
    const hasDisabledOptions = this.disabledOptions.length;
    const { valueKey, labelKey, descriptionKey, aliasKey, hasOptionDescription } = this;
    const { getString, convertToBoolean } = Utils;
    const secureText = this.secureText.bind(this);
    const getAlias = this.getAlias.bind(this);
    let index = 0;
    let hasOptionGroup = false;
    const disabledOptionsMapping = {};
    let hasEmptyValueOption = false;

    this.disabledOptions.forEach((d) => {
      disabledOptionsMapping[d] = true;
    });

    const prepareOption = (d) => {
      if (typeof d !== 'object') {
        // eslint-disable-next-line no-param-reassign
        d = { [valueKey]: d, [labelKey]: d };
      }

      const value = secureText(getString(d[valueKey]));
      const childOptions = d.options;
      const isGroupTitle = !!childOptions;
      const option = {
        index,
        value,
        label: secureText(getString(d[labelKey])),
        alias: getAlias(d[aliasKey]),
        isVisible: convertToBoolean(d.isVisible, true),
        isNew: d.isNew || false,
        isGroupTitle,
        classNames: d.classNames,
      };

      if (!hasEmptyValueOption && value === '') {
        hasEmptyValueOption = true;
      }

      if (hasDisabledOptions) {
        option.isDisabled = disabledOptionsMapping[value] === true;
      }

      if (d.isGroupOption) {
        option.isGroupOption = true;
        option.groupIndex = d.groupIndex;
      }

      if (hasOptionDescription) {
        option.description = secureText(getString(d[descriptionKey]));
      }

      if (d.customData) {
        option.customData = d.customData;
      }

      preparedOptions.push(option);
      index += 1;

      if (isGroupTitle) {
        const groupIndex = option.index;
        hasOptionGroup = true;

        childOptions.forEach((childData) => {
          // eslint-disable-next-line no-param-reassign
          childData.isGroupOption = true;
          // eslint-disable-next-line no-param-reassign
          childData.groupIndex = groupIndex;

          prepareOption(childData);
        });
      }
    };

    if (Array.isArray(options)) {
      options.forEach(prepareOption);
    }

    const optionsLength = preparedOptions.length;
    const { $ele } = this;
    $ele.options = preparedOptions;
    $ele.length = optionsLength;
    this.options = preparedOptions;
    this.visibleOptionsCount = optionsLength;
    this.lastOptionIndex = optionsLength - 1;
    this.newValues = [];
    this.hasOptionGroup = hasOptionGroup;
    this.hasEmptyValueOption = hasEmptyValueOption;
    this.setSortedOptions();
  }

  setServerOptions(options = []) {
    this.setOptionsMethod(options, true);

    const { selectedOptions } = this;
    const newOptions = this.options;
    let optionsUpdated = false;

    /** merging already selected options details with new options */
    if (selectedOptions.length) {
      const newOptionsValueMapping = {};
      optionsUpdated = true;

      newOptions.forEach((d) => {
        newOptionsValueMapping[d.value] = true;
      });

      selectedOptions.forEach((d) => {
        if (newOptionsValueMapping[d.value] !== true) {
          // eslint-disable-next-line no-param-reassign
          d.isVisible = false;
          newOptions.push(d);
        }
      });

      this.setOptionsMethod(newOptions, true);
    }

    /** merging new search option */
    if (this.allowNewOption && this.searchValue) {
      const hasExactOption = newOptions.some((d) => d.label.toLowerCase() === this.searchValue);

      if (!hasExactOption) {
        optionsUpdated = true;
        this.setNewOption();
      }
    }

    if (optionsUpdated) {
      this.setVisibleOptionsCount();

      if (this.multiple) {
        this.toggleAllOptionsClass();
      }

      this.setValueText();
    } else {
      this.updatePosition();
    }

    DomUtils.removeClass(this.$allWrappers, 'server-searching');
  }

  setSelectedOptions() {
    this.selectedOptions = this.options.filter((d) => d.isSelected);
  }

  setSortedOptions() {
    let sortedOptions = [...this.options];

    if (this.showSelectedOptionsFirst && this.selectedValues.length) {
      if (this.hasOptionGroup) {
        sortedOptions = this.sortOptionsGroup(sortedOptions);
      } else {
        sortedOptions = this.sortOptions(sortedOptions);
      }
    }

    this.sortedOptions = sortedOptions;
  }

  setVisibleOptions() {
    let visibleOptions = [...this.sortedOptions];
    const maxOptionsToShow = this.optionsCount * 2;
    const startIndex = this.getVisibleStartIndex();
    const newOption = this.getNewOption();
    const endIndex = startIndex + maxOptionsToShow - 1;
    let i = 0;

    if (newOption) {
      newOption.visibleIndex = i;
      i += 1;
    }

    visibleOptions = visibleOptions.filter((d) => {
      let inView = false;

      if (d.isVisible && !d.isCurrentNew) {
        inView = i >= startIndex && i <= endIndex;
        // eslint-disable-next-line no-param-reassign
        d.visibleIndex = i;
        i += 1;
      }

      return inView;
    });

    if (newOption) {
      visibleOptions = [newOption, ...visibleOptions];
    }

    this.visibleOptions = visibleOptions;
    this.renderOptions();
  }

  setOptionsPosition(startIndex) {
    const top = (startIndex || this.getVisibleStartIndex()) * this.optionHeight;
    this.$options.style.transform = `translate3d(0, ${top}px, 0)`;
    DomUtils.setData(this.$options, 'top', top);
  }

  setOptionsTooltip() {
    const visibleOptions = this.getVisibleOptions();
    const { hasOptionDescription } = this;

    visibleOptions.forEach((d) => {
      const $optionEle = this.$dropboxContainer.querySelector(`.vscomp-option[data-index="${d.index}"]`);

      DomUtils.setData($optionEle.querySelector('.vscomp-option-text'), 'tooltip', d.label);

      if (hasOptionDescription) {
        DomUtils.setData($optionEle.querySelector('.vscomp-option-description'), 'tooltip', d.description);
      }
    });
  }

  setValue(value, { disableEvent = false, disableValidation = false } = {}) {
    const isValidValue = (this.hasEmptyValueOption && value === '') || value;

    if (!isValidValue) {
      this.selectedValues = [];
    } else if (Array.isArray(value)) {
      this.selectedValues = [...value];
    } else {
      this.selectedValues = [value];
    }

    const newValue = this.getValue();
    this.$ele.value = newValue;
    this.$hiddenInput.value = this.getInputValue(newValue);
    this.isMaxValuesSelected = !!(this.maxValues && this.maxValues <= this.selectedValues.length);

    this.toggleAllOptionsClass();
    this.setValueText();

    DomUtils.toggleClass(this.$allWrappers, 'has-value', Utils.isNotEmpty(this.selectedValues));
    DomUtils.toggleClass(this.$allWrappers, 'max-value-selected', this.isMaxValuesSelected);

    if (!disableValidation) {
      this.validate();
    }

    if (!disableEvent) {
      DomUtils.dispatchEvent(this.$ele, 'change', true);
    }
  }

  setValueText() {
    const { multiple, selectedValues, noOfDisplayValues, showValueAsTags, $valueText } = this;
    const valueText = [];
    let valueTooltip = [];
    const selectedLength = selectedValues.length;
    let selectedValuesCount = 0;
    const showAllText =
      this.isAllSelected && !this.hasServerSearch && !this.disableAllOptionsSelectedText && !showValueAsTags;

    /** show all values selected text without tooltip text */
    if (showAllText && this.hideValueTooltipOnSelectAll) {
      $valueText.innerHTML = `${this.allOptionsSelectedText} (${selectedLength})`;
    } else {
      const selectedOptions = this.getSelectedOptions({
        fullDetails: true,
        keepSelectionOrder: true,
      });

      selectedOptions.some((d) => {
        if (d.isCurrentNew) {
          return false;
        }

        if (selectedValuesCount >= noOfDisplayValues) {
          return true;
        }

        const { label } = d;
        valueText.push(label);
        selectedValuesCount += 1;

        if (showValueAsTags) {
          const valueTagHtml = `<span class="vscomp-value-tag" data-index="${d.index}">
              <span class="vscomp-value-tag-content">${label}</span>
              <span class="vscomp-value-tag-clear-button">
                <i class="vscomp-clear-icon"></i>
              </span>
            </span>`;

          valueTooltip.push(valueTagHtml);
        } else {
          valueTooltip.push(label);
        }

        return false;
      });

      const moreSelectedOptions = selectedLength - noOfDisplayValues;

      if (moreSelectedOptions > 0) {
        valueTooltip.push(
          `<span class="vscomp-value-tag more-value-count">+ ${moreSelectedOptions} ${this.moreText}</span>`,
        );
      }

      const aggregatedValueText = valueText.join(', ');

      if (aggregatedValueText === '') {
        $valueText.innerHTML = this.placeholder;
      } else {
        $valueText.innerHTML = aggregatedValueText;

        if (multiple) {
          const { maxValues } = this;

          const showSelectedCount = this.alwaysShowSelectedOptionsCount || DomUtils.hasEllipsis($valueText);

          if (showSelectedCount || maxValues || showValueAsTags) {
            let countText = `<span class="vscomp-selected-value-count">${selectedLength}</span>`;

            if (maxValues) {
              countText += ` / <span class="vscomp-max-value-count">${maxValues}</span>`;
            }

            /** show all values selected text with tooltip text */
            if (showAllText) {
              $valueText.innerHTML = `${this.allOptionsSelectedText} (${selectedLength})`;
            } else if (showValueAsTags) {
              $valueText.innerHTML = valueTooltip.join('');
              this.$valueTags = $valueText.querySelectorAll('.vscomp-value-tag');

              this.setValueTagAttr();
            } else if (!this.alwaysShowSelectedOptionsLabel) {
              /** replace comma separated list of selections with shorter text indicating selection count */
              const optionsSelectedText = selectedLength === 1 ? this.optionSelectedText : this.optionsSelectedText;
              $valueText.innerHTML = `${countText} ${optionsSelectedText}`;
            }
          } else {
            /** removing tooltip if full value text is visible */
            valueTooltip = [];
          }
        }
      }
    }

    let tooltipText = '';

    if (selectedLength === 0) {
      tooltipText = this.placeholder;
    } else if (!showValueAsTags) {
      tooltipText = valueTooltip.join(', ');
    }

    DomUtils.setData($valueText, 'tooltip', tooltipText);

    if (multiple) {
      DomUtils.setData($valueText, 'tooltipEllipsisOnly', selectedLength === 0);

      if (showValueAsTags) {
        this.updatePosition();
      }
    }
  }

  setSearchValue(value, skipInputSet = false, forceSet = false) {
    if (value === this.searchValueOriginal && !forceSet) {
      return;
    }

    if (!skipInputSet) {
      this.$searchInput.value = value;
    }

    const searchValue = value.replace(/\\/g, '').toLowerCase().trim();
    this.searchValue = searchValue;
    this.searchValueOriginal = value;

    DomUtils.toggleClass(this.$allWrappers, 'has-search-value', value);

    this.afterSetSearchValue();
  }

  setVisibleOptionsCount() {
    let visibleOptionsCount = 0;
    let hasExactOption = false;
    let visibleOptionGroupsMapping;
    const { searchValue, searchGroup, showOptionsOnlyOnSearch, searchByStartsWith } = this;
    const isOptionVisible = this.isOptionVisible.bind(this);

    if (this.hasOptionGroup) {
      visibleOptionGroupsMapping = this.getVisibleOptionGroupsMapping(searchValue);
    }

    this.options.forEach((d) => {
      if (d.isCurrentNew) {
        return;
      }

      let result;

      if (showOptionsOnlyOnSearch && !searchValue) {
        // eslint-disable-next-line no-param-reassign
        d.isVisible = false;
        result = {
          isVisible: false,
          hasExactOption: false,
        };
      } else {
        result = isOptionVisible({
          data: d,
          searchValue,
          hasExactOption,
          visibleOptionGroupsMapping,
          searchGroup,
          searchByStartsWith,
        });
      }

      if (result.isVisible) {
        visibleOptionsCount += 1;
      }

      if (!hasExactOption) {
        hasExactOption = result.hasExactOption;
      }
    });

    if (this.allowNewOption) {
      if (searchValue && !hasExactOption) {
        this.setNewOption();
        visibleOptionsCount += 1;
      } else {
        this.removeNewOption();
      }
    }

    this.visibleOptionsCount = visibleOptionsCount;

    this.afterSetVisibleOptionsCount();
  }

  setOptionProp(index, key, value) {
    if (!this.options[index]) {
      return;
    }

    this.options[index][key] = value;
  }

  setOptionsHeight() {
    this.$optionsList.style.height = `${this.optionHeight * this.visibleOptionsCount}px`;
  }

  setOptionsContainerHeight(reset) {
    let optionsHeight;

    if (reset) {
      if (this.showAsPopup) {
        this.optionsCount = this.getOptionsCount();
        this.halfOptionsCount = Math.ceil(this.optionsCount / 2);
        optionsHeight = this.getOptionsHeight();
        this.optionsHeight = optionsHeight;
      }
    } else {
      optionsHeight = this.optionsHeight;

      if (this.keepAlwaysOpen) {
        DomUtils.setStyle(this.$noOptions, 'height', optionsHeight);
        DomUtils.setStyle(this.$noSearchResults, 'height', optionsHeight);
      }
    }

    DomUtils.setStyle(this.$optionsContainer, 'max-height', optionsHeight);

    this.afterSetOptionsContainerHeight(reset);
  }

  setNewOption(newValue) {
    const value = newValue || this.searchValueOriginal.trim();

    if (!value) {
      return;
    }

    const newOption = this.getNewOption();

    if (newOption) {
      const newIndex = newOption.index;

      this.setOptionProp(newIndex, 'value', this.secureText(value));
      this.setOptionProp(newIndex, 'label', this.secureText(value));
    } else {
      const data = {
        value,
        label: value,
      };

      if (newValue) {
        data.isNew = true;
        this.newValues.push(value);
      } else {
        data.isCurrentNew = true;
      }

      this.addOption(data);
    }
  }

  setSelectedProp() {
    const valuesMapping = {};

    this.selectedValues.forEach((d) => {
      valuesMapping[d] = true;
    });

    this.options.forEach((d) => {
      if (valuesMapping[d.value] === true) {
        // eslint-disable-next-line no-param-reassign
        d.isSelected = true;
      }
    });
  }

  setNewOptionsFromValue(values) {
    if (!values) {
      return;
    }

    const setNewOption = this.setNewOption.bind(this);
    const availableValuesMapping = {};

    this.options.forEach((d) => {
      availableValuesMapping[d.value] = true;
    });

    values.forEach((d) => {
      if (d && availableValuesMapping[d] !== true) {
        setNewOption(d);
      }
    });
  }

  setDropboxWrapperWidth() {
    if (this.showAsPopup) {
      return;
    }

    const width = this.dropboxWidth || `${this.$wrapper.offsetWidth}px`;

    DomUtils.setStyle(this.$dropboxContainer, 'max-width', width);
  }

  setEleStyles() {
    const { maxWidth } = this;
    const styles = {};

    if (maxWidth) {
      styles['max-width'] = maxWidth;
    }

    DomUtils.setStyles(this.$ele, styles);
  }

  setDropboxStyles() {
    const { dropboxWidth } = this;
    const styles = {};
    const containerStyles = {
      'z-index': this.zIndex,
    };

    if (dropboxWidth) {
      if (this.showAsPopup) {
        styles['max-width'] = dropboxWidth;
      } else {
        containerStyles.width = dropboxWidth;
      }
    }

    DomUtils.setStyles(this.$dropboxContainer, containerStyles);
    DomUtils.setStyles(this.$dropbox, styles);
  }

  setOptionAttr() {
    const { $visibleOptions } = this;
    const { options } = this;
    const optionHeight = `${this.optionHeight}px`;
    const { setStyle, getData, setData } = DomUtils;

    if ($visibleOptions && $visibleOptions.length) {
      $visibleOptions.forEach(($option) => {
        const optionDetails = options[getData($option, 'index')];

        setStyle($option, 'height', optionHeight);
        setData($option, 'value', optionDetails.value);
      });
    }
  }

  setValueTagAttr() {
    const { $valueTags } = this;

    if (!$valueTags || !$valueTags.length) {
      return;
    }

    const { getData, setData } = DomUtils;
    const { options } = this;

    $valueTags.forEach(($valueTag) => {
      const index = getData($valueTag, 'index');

      if (typeof index !== 'undefined') {
        const optionDetails = options[index];

        setData($valueTag, 'value', optionDetails.value);
      }
    });
  }

  setScrollTop() {
    const { selectedValues } = this;

    if (this.showSelectedOptionsFirst || !this.focusSelectedOptionOnOpen || selectedValues.length === 0) {
      return;
    }

    const valuesMapping = {};
    let selectedOptionIndex;

    selectedValues.forEach((d) => {
      valuesMapping[d] = true;
    });

    this.options.some((d) => {
      if (valuesMapping[d.value]) {
        selectedOptionIndex = d.visibleIndex;
        return true;
      }

      return false;
    });

    if (selectedOptionIndex) {
      this.$optionsContainer.scrollTop = this.optionHeight * selectedOptionIndex;
    }
  }
  /** set methods - end */

  /** get methods - start */
  getVisibleOptions() {
    return this.visibleOptions || [];
  }

  getValue() {
    let value;

    if (this.multiple) {
      if (this.useGroupValue) {
        value = this.getGroupValue();
      } else {
        value = this.selectedValues;
      }
    } else {
      value = this.selectedValues[0] || '';
    }

    return value;
  }

  getGroupValue() {
    const selectedValues = [];
    const selectedGroups = {};

    this.options.forEach((d) => {
      if (!d.isSelected) {
        return;
      }

      const { value } = d;

      if (d.isGroupTitle) {
        if (value) {
          selectedGroups[d.index] = true;
          selectedValues.push(value);
        }
      } else if (selectedGroups[d.groupIndex] !== true) {
        selectedValues.push(value);
      }
    });

    return selectedValues;
  }

  getInputValue(preparedValue) {
    let value = preparedValue;

    if (value && value.length) {
      if (this.setValueAsArray && this.multiple) {
        value = JSON.stringify(value);
      }
    } else {
      value = this.emptyValue;
    }

    return value;
  }

  getFirstVisibleOptionIndex() {
    return Math.ceil(this.$optionsContainer.scrollTop / this.optionHeight);
  }

  getVisibleStartIndex() {
    const firstVisibleOptionIndex = this.getFirstVisibleOptionIndex();
    let startIndex = firstVisibleOptionIndex - this.halfOptionsCount;

    if (startIndex < 0) {
      startIndex = 0;
    }

    return startIndex;
  }

  getTooltipAttrText(text, ellipsisOnly = false, allowHtml = false) {
    const data = {
      'data-tooltip': text || '',
      'data-tooltip-enter-delay': this.tooltipEnterDelay,
      'data-tooltip-z-index': this.zIndex,
      'data-tooltip-font-size': this.tooltipFontSize,
      'data-tooltip-alignment': this.tooltipAlignment,
      'data-tooltip-max-width': this.tooltipMaxWidth,
      'data-tooltip-ellipsis-only': ellipsisOnly,
      'data-tooltip-allow-html': allowHtml,
    };

    return DomUtils.getAttributesText(data);
  }

  /**
   * @param {any} data
   * @returns {any}
   */
  getOptionObj(data) {
    if (!data) {
      return undefined;
    }

    const { getString } = Utils;
    const secureText = this.secureText.bind(this);

    return {
      index: data.index,
      value: secureText(getString(data.value)),
      label: secureText(getString(data.label)),
      description: secureText(getString(data.description)),
      alias: this.getAlias(data.alias),
      isCurrentNew: data.isCurrentNew || false,
      isNew: data.isNew || false,
      isVisible: true,
    };
  }

  getNewOption() {
    const lastOption = this.options[this.lastOptionIndex];

    if (!lastOption || !lastOption.isCurrentNew) {
      return undefined;
    }

    return lastOption;
  }

  getOptionIndex(value) {
    let index;

    this.options.some((d) => {
      if (d.value === value) {
        index = d.index;

        return true;
      }

      return false;
    });

    return index;
  }

  getNewValue() {
    const valuesMapping = {};

    this.newValues.forEach((d) => {
      valuesMapping[d] = true;
    });

    const result = this.selectedValues.filter((d) => valuesMapping[d] === true);

    return this.multiple ? result : result[0];
  }

  getAlias(alias) {
    let result = alias;

    if (result) {
      if (Array.isArray(result)) {
        result = result.join(',');
      } else {
        result = result.toString().trim();
      }

      result = result.toLowerCase();
    }

    return result || '';
  }

  getDisplayValue() {
    const displayValues = [];

    this.options.forEach((d) => {
      if (d.isSelected) {
        displayValues.push(d.label);
      }
    });

    return this.multiple ? displayValues : displayValues[0] || '';
  }

  getSelectedOptions({ fullDetails = false, keepSelectionOrder = false } = {}) {
    const { valueKey, labelKey, selectedValues } = this;
    const selectedOptions = [];

    this.options.forEach((d) => {
      if (d.isSelected && !d.isGroupTitle) {
        if (fullDetails) {
          selectedOptions.push(d);
        } else {
          const data = {
            [valueKey]: d.value,
            [labelKey]: d.label,
          };

          if (d.isNew) {
            data.isNew = true;
          }

          if (d.customData) {
            data.customData = d.customData;
          }

          selectedOptions.push(data);
        }
      }
    });

    if (keepSelectionOrder) {
      const valuesOrder = {};

      selectedValues.forEach((d, i) => {
        valuesOrder[d] = i;
      });

      selectedOptions.sort((a, b) => valuesOrder[a.value] - valuesOrder[b.value]);
    }

    return this.multiple || fullDetails ? selectedOptions : selectedOptions[0];
  }

  getDisabledOptions() {
    const { valueKey, labelKey, disabledOptions } = this;
    const disabledOptionsValueMapping = {};
    const result = [];

    disabledOptions.forEach((value) => {
      disabledOptionsValueMapping[value] = true;
    });

    this.options.forEach(({ value, label }) => {
      if (disabledOptionsValueMapping[value]) {
        result.push({
          [valueKey]: value,
          [labelKey]: label,
        });
      }
    });

    return result;
  }

  getVisibleOptionGroupsMapping(searchValue) {
    let { options } = this;
    const result = {};
    const isOptionVisible = this.isOptionVisible.bind(this);
    options = this.structureOptionGroup(options);

    options.forEach((d) => {
      result[d.index] = d.options.some((e) => isOptionVisible({ data: e, searchValue }).isVisible);
    });

    return result;
  }

  getOptionsCount(count) {
    let result;

    if (this.showAsPopup) {
      let availableHeight = (window.innerHeight * 80) / 100 - dropboxCloseButtonFullHeight;

      if (this.hasSearchContainer) {
        availableHeight -= searchHeight;
      }

      result = Math.floor(availableHeight / this.optionHeight);
    } else {
      result = parseInt(count);
    }

    return result;
  }

  getOptionsHeight() {
    return `${this.optionsCount * this.optionHeight}px`;
  }

  /** getting next/prev valid option element */
  getSibling($ele, direction) {
    const propName = direction === 'next' ? 'nextElementSibling' : 'previousElementSibling';
    let $sibling = $ele;

    do {
      if ($sibling) {
        $sibling = $sibling[propName];
      }
    } while (DomUtils.hasClass($sibling, 'disabled') || DomUtils.hasClass($sibling, 'group-title'));

    return $sibling;
  }

  getUniqueId() {
    const uniqueId = Utils.getRandomInt(10000);
    const isAlreadyUsed = document.querySelector(`#vscomp-ele-wrapper-${uniqueId}`);

    if (isAlreadyUsed) {
      return this.getUniqueId();
    }

    return uniqueId;
  }
  /** get methods - end */

  initDropboxPopover() {
    const data = {
      ele: this.$ele,
      target: this.$dropboxContainer,
      position: this.position,
      zIndex: this.zIndex,
      margin: 4,
      transitionDistance: 30,
      hideArrowIcon: true,
      disableManualAction: true,
      disableUpdatePosition: !this.hasDropboxWrapper,
      updatePositionThrottle: this.updatePositionThrottle,
      afterShow: this.afterShowPopper.bind(this),
      afterHide: this.afterHidePopper.bind(this),
    };

    this.dropboxPopover = new PopoverComponent(data);
  }

  openDropbox(isSilent) {
    this.isSilentOpen = isSilent;

    if (isSilent) {
      DomUtils.setStyle(this.$dropboxContainer, 'display', 'inline-flex');
    } else {
      DomUtils.dispatchEvent(this.$ele, 'beforeOpen');
      DomUtils.setAria(this.$wrapper, 'expanded', true);
    }

    this.setDropboxWrapperWidth();

    DomUtils.removeClass(this.$allWrappers, 'closed');

    if (this.dropboxPopover && !isSilent) {
      this.dropboxPopover.show();
    } else {
      this.afterShowPopper();
    }
  }

  afterShowPopper() {
    const isSilent = this.isSilentOpen;
    this.isSilentOpen = false;

    if (!isSilent) {
      this.moveSelectedOptionsFirst();
      this.setScrollTop();
      DomUtils.addClass(this.$allWrappers, 'focused');

      if (this.showAsPopup) {
        DomUtils.addClass(this.$body, 'vscomp-popup-active');
        this.isPopupActive = true;
      } else {
        this.focusSearchInput();
      }

      DomUtils.dispatchEvent(this.$ele, 'afterOpen');
    }
  }

  closeDropbox(isSilent) {
    this.isSilentClose = isSilent;

    if (this.keepAlwaysOpen) {
      this.removeOptionFocus();
      return;
    }

    if (isSilent) {
      DomUtils.setStyle(this.$dropboxContainer, 'display', '');
    } else {
      DomUtils.dispatchEvent(this.$ele, 'beforeClose');
      DomUtils.setAria(this.$wrapper, 'expanded', false);
      DomUtils.setAria(this.$wrapper, 'activedescendant', '');
    }

    if (this.dropboxPopover && !isSilent) {
      this.dropboxPopover.hide();
    } else {
      this.afterHidePopper();
    }
  }

  afterHidePopper() {
    const isSilent = this.isSilentClose;
    this.isSilentClose = false;

    DomUtils.removeClass(this.$allWrappers, 'focused');
    this.removeOptionFocus();

    if (!isSilent && this.isPopupActive) {
      DomUtils.removeClass(this.$body, 'vscomp-popup-active');
      this.isPopupActive = false;
    }

    DomUtils.addClass(this.$allWrappers, 'closed');

    if (!isSilent) {
      DomUtils.dispatchEvent(this.$ele, 'afterClose');
    }
  }

  moveSelectedOptionsFirst() {
    if (!this.showSelectedOptionsFirst) {
      return;
    }

    this.setSortedOptions();

    if (!this.$optionsContainer.scrollTop || !this.selectedValues.length) {
      this.setVisibleOptions();
    } else {
      this.scrollToTop();
    }
  }

  toggleDropbox() {
    if (this.isOpened()) {
      this.closeDropbox();
    } else {
      this.openDropbox();
    }
  }

  updatePosition() {
    if (!this.dropboxPopover || !this.isOpened()) {
      return;
    }

    this.$ele.updatePosition();
  }

  isOpened() {
    return !DomUtils.hasClass(this.$wrapper, 'closed');
  }

  focusSearchInput() {
    const $ele = this.$searchInput;

    if ($ele) {
      $ele.focus();
    }
  }

  focusOption({ direction, $option, focusFirst } = {}) {
    const $focusedEle = this.$dropboxContainer.querySelector('.vscomp-option.focused');
    let $newFocusedEle;

    if ($option) {
      $newFocusedEle = $option;
    } else if (!$focusedEle || focusFirst) {
      /* if no element on focus choose first visible one */
      const firstVisibleOptionIndex = this.getFirstVisibleOptionIndex();
      $newFocusedEle = this.$dropboxContainer.querySelector(
        `.vscomp-option[data-visible-index="${firstVisibleOptionIndex}"]`,
      );

      if (DomUtils.hasClass($newFocusedEle, 'disabled') || DomUtils.hasClass($newFocusedEle, 'group-title')) {
        $newFocusedEle = this.getSibling($newFocusedEle, 'next');
      }
    } else {
      $newFocusedEle = this.getSibling($focusedEle, direction);
    }

    if ($newFocusedEle && $newFocusedEle !== $focusedEle) {
      if ($focusedEle) {
        this.toggleOptionFocusedState($focusedEle, false);
      }

      this.toggleOptionFocusedState($newFocusedEle, true);
      this.toggleFocusedProp(DomUtils.getData($newFocusedEle, 'index'), true);
      this.moveFocusedOptionToView($newFocusedEle);
    }
  }

  moveFocusedOptionToView($ele) {
    const $focusedEle = $ele || this.$dropboxContainer.querySelector('.vscomp-option.focused');

    if (!$focusedEle) {
      return;
    }

    let newScrollTop;
    const containerRect = this.$optionsContainer.getBoundingClientRect();
    const optionRect = $focusedEle.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;
    const containerHeight = containerRect.height;
    const optionTop = optionRect.top;
    const optionBottom = optionRect.bottom;
    const optionHeight = optionRect.height;
    const optionOffsetTop = $focusedEle.offsetTop;
    const optionsTop = DomUtils.getData(this.$options, 'top', 'number');

    /* if option hidden on top */
    if (containerTop > optionTop) {
      newScrollTop = optionOffsetTop + optionsTop;
    } else if (containerBottom < optionBottom) {
      /* if option hidden on bottom */
      newScrollTop = optionOffsetTop - containerHeight + optionHeight + optionsTop;
    }

    if (newScrollTop !== undefined) {
      this.$optionsContainer.scrollTop = newScrollTop;
    }
  }

  removeOptionFocus() {
    const $focusedEle = this.$dropboxContainer.querySelector('.vscomp-option.focused');

    if (!$focusedEle) {
      return;
    }

    this.toggleOptionFocusedState($focusedEle, false);
    this.toggleFocusedProp(null);
  }

  selectOption($ele, { event } = {}) {
    if (!$ele) {
      return;
    }

    const isAdding = !DomUtils.hasClass($ele, 'selected');

    if (isAdding) {
      if (this.multiple && this.isMaxValuesSelected) {
        return;
      }
    } else if (!this.multiple) {
      /** on selecting same value in single select */
      this.closeDropbox();
      return;
    }

    let { selectedValues } = this;
    const selectedValue = DomUtils.getData($ele, 'value');
    const selectedIndex = DomUtils.getData($ele, 'index', 'number');
    const isNewOption = DomUtils.hasClass($ele, 'current-new');
    let shouldSelectRange = false;
    const { lastSelectedOptionIndex } = this;
    this.lastSelectedOptionIndex = null;

    this.toggleSelectedProp(selectedIndex, isAdding);

    if (isAdding) {
      if (this.multiple) {
        selectedValues.push(selectedValue);
        this.toggleAllOptionsClass();
        this.toggleGroupOptionsParent($ele);

        if (event && event.shiftKey) {
          shouldSelectRange = true;
        }
      } else {
        if (selectedValues.length) {
          this.toggleSelectedProp(this.getOptionIndex(selectedValues[0]), false);
        }

        selectedValues = [selectedValue];
        const $prevSelectedOption = this.$dropboxContainer.querySelector('.vscomp-option.selected');

        if ($prevSelectedOption) {
          this.toggleOptionSelectedState($prevSelectedOption, false);
        }

        this.closeDropbox();

        if (!isNewOption) {
          this.setSearchValue('');
        }
      }

      this.lastSelectedOptionIndex = selectedIndex;

      this.toggleOptionSelectedState($ele);
    } else if (this.multiple) {
      this.toggleOptionSelectedState($ele);
      Utils.removeItemFromArray(selectedValues, selectedValue);
      this.toggleAllOptionsClass(false);
      this.toggleGroupOptionsParent($ele, false);
    }

    if (isNewOption) {
      this.beforeSelectNewValue();
    }

    this.setValue(selectedValues);

    if (shouldSelectRange) {
      this.selectRangeOptions(lastSelectedOptionIndex, selectedIndex);
    }
  }

  selectFocusedOption() {
    this.selectOption(this.$dropboxContainer.querySelector('.vscomp-option.focused'));
  }

  selectRangeOptions(lastSelectedOptionIndex, selectedIndex) {
    if (typeof lastSelectedOptionIndex !== 'number' || this.maxValues) {
      return;
    }

    const { selectedValues, hasOptionGroup } = this;
    let groupIndexes = {};
    let startIndex;
    let endIndex;

    if (lastSelectedOptionIndex < selectedIndex) {
      startIndex = lastSelectedOptionIndex;
      endIndex = selectedIndex;
    } else {
      startIndex = selectedIndex;
      endIndex = lastSelectedOptionIndex;
    }

    this.options.forEach((d) => {
      if (d.isDisabled || d.isGroupTitle || !d.isVisible || d.isSelected) {
        return;
      }

      const { index } = d;

      if (index > startIndex && index < endIndex) {
        if (hasOptionGroup) {
          const { groupIndex } = d;

          if (typeof groupIndex === 'number') {
            groupIndexes[groupIndex] = true;
          }
        }

        // eslint-disable-next-line no-param-reassign
        d.isSelected = true;

        selectedValues.push(d.value);
      }
    });

    this.toggleAllOptionsClass();
    this.setValue(selectedValues);

    groupIndexes = Object.keys(groupIndexes);

    if (groupIndexes.length) {
      const toggleGroupTitleProp = this.toggleGroupTitleProp.bind(this);

      groupIndexes.forEach((i) => {
        toggleGroupTitleProp(parseInt(i));
      });
    }

    /** using setTimeout to fix the issue of dropbox getting closed on select */
    setTimeout(() => {
      this.renderOptions();
    }, 0);
  }

  toggleAllOptions(selectAll) {
    if (!this.multiple || this.disableSelectAll) {
      return;
    }

    const selectingAll =
      typeof isSelected === 'boolean' ? selectAll : !DomUtils.hasClass(this.$toggleAllCheckbox, 'checked');

    const selectedValues = [];
    const { selectAllOnlyVisible } = this;

    this.options.forEach((d) => {
      const option = d;

      if (option.isDisabled || option.isCurrentNew) {
        return;
      }

      const { isVisible, isSelected } = option;

      /** unselected items are */
      if (
        /** when unselecting all, selectAllOnlyVisible feature disabled or visible items or already unselected items */
        (!selectingAll && (!selectAllOnlyVisible || isVisible || !isSelected)) ||
        /** when selecting all, selectAllOnlyVisible feature enabled and hidden items those are not already selected */
        (selectingAll && selectAllOnlyVisible && !isVisible && !isSelected)
      ) {
        option.isSelected = false;
      } else {
        option.isSelected = true;

        if (!option.isGroupTitle) {
          selectedValues.push(option.value);
        }
      }
    });

    this.toggleAllOptionsClass(selectingAll);
    this.setValue(selectedValues);
    this.renderOptions();
  }

  toggleAllOptionsClass(isAllSelected) {
    if (!this.multiple) {
      return;
    }

    const valuePassed = typeof isAllSelected === 'boolean';
    let isAllVisibleSelected = false;

    if (!valuePassed) {
      // eslint-disable-next-line no-param-reassign
      isAllSelected = this.isAllOptionsSelected();
    }

    /** when all options not selected, checking if all visible options selected */
    if (!isAllSelected && this.selectAllOnlyVisible) {
      isAllVisibleSelected = this.isAllOptionsSelected(true);
    }

    DomUtils.toggleClass(this.$toggleAllCheckbox, 'checked', isAllSelected || isAllVisibleSelected);

    this.isAllSelected = isAllSelected;
  }

  isAllOptionsSelected(visibleOnly) {
    let isAllSelected = false;

    if (this.options.length && this.selectedValues.length) {
      isAllSelected = !this.options.some(
        /**
         * stop looping if any option is not selected
         * for selectAllOnlyVisible case hidden option need not to be selected
         */
        (d) => !d.isSelected && !d.isDisabled && !d.isGroupTitle && (!visibleOnly || d.isVisible),
      );
    }

    return isAllSelected;
  }

  isAllGroupOptionsSelected(groupIndex) {
    let isAllSelected = false;

    if (this.options.length) {
      isAllSelected = !this.options.some(
        (d) => !d.isSelected && !d.isDisabled && !d.isGroupTitle && d.groupIndex === groupIndex,
      );
    }

    return isAllSelected;
  }

  toggleGroupOptionsParent($option, isSelected) {
    if (!this.hasOptionGroup || this.disableOptionGroupCheckbox || !$option) {
      return;
    }

    let groupIndex = DomUtils.getData($option, 'groupIndex');

    if (groupIndex !== undefined) {
      groupIndex = parseInt(groupIndex);
    }

    const $group = this.$options.querySelector(`.vscomp-option[data-index="${groupIndex}"]`);
    const isAllSelected = typeof isSelected === 'boolean' ? isSelected : this.isAllGroupOptionsSelected(groupIndex);

    this.toggleGroupTitleCheckbox($group, isAllSelected);
    this.toggleGroupTitleProp(groupIndex, isAllSelected);
  }

  toggleGroupTitleProp(groupIndex, isSelected) {
    const isAllSelected = typeof isSelected === 'boolean' ? isSelected : this.isAllGroupOptionsSelected(groupIndex);

    this.toggleSelectedProp(groupIndex, isAllSelected);
  }

  toggleGroupOptions($ele, isSelected) {
    if (!this.hasOptionGroup || this.disableOptionGroupCheckbox || !$ele) {
      return;
    }

    const groupIndex = DomUtils.getData($ele, 'index', 'number');
    const { selectedValues, selectAllOnlyVisible } = this;
    const valuesMapping = {};
    const { removeItemFromArray } = Utils;

    selectedValues.forEach((d) => {
      valuesMapping[d] = true;
    });

    this.options.forEach((d) => {
      if (d.isDisabled || d.groupIndex !== groupIndex) {
        return;
      }

      const { value } = d;

      if (!isSelected || (selectAllOnlyVisible && !d.isVisible)) {
        // eslint-disable-next-line no-param-reassign
        d.isSelected = false;

        if (valuesMapping[value]) {
          removeItemFromArray(selectedValues, value);
        }
      } else {
        // eslint-disable-next-line no-param-reassign
        d.isSelected = true;

        if (!valuesMapping[value]) {
          selectedValues.push(value);
        }
      }
    });

    this.toggleAllOptionsClass(isSelected ? null : false);
    this.setValue(selectedValues);

    /** using setTimeout to fix the issue of dropbox getting closed on select */
    setTimeout(() => {
      this.renderOptions();
    }, 0);
  }

  toggleGroupTitleCheckbox($ele, isSelected) {
    if (!$ele) {
      return;
    }

    const selectedIndex = DomUtils.getData($ele, 'index', 'number');

    this.toggleSelectedProp(selectedIndex, isSelected);
    this.toggleOptionSelectedState($ele, isSelected);
  }

  toggleFocusedProp(index, isFocused = false) {
    if (this.focusedOptionIndex) {
      this.setOptionProp(this.focusedOptionIndex, 'isFocused', false);
    }

    this.setOptionProp(index, 'isFocused', isFocused);
    this.focusedOptionIndex = index;
  }

  toggleSelectedProp(index, isSelected = false) {
    this.setOptionProp(index, 'isSelected', isSelected);
  }

  scrollToTop() {
    const isClosed = !this.isOpened();

    if (isClosed) {
      this.openDropbox(true);
    }

    const { scrollTop } = this.$optionsContainer;

    if (scrollTop > 0) {
      this.$optionsContainer.scrollTop = 0;
    }

    if (isClosed) {
      this.closeDropbox(true);
    }
  }

  reset(formReset = false) {
    this.options.forEach((d) => {
      // eslint-disable-next-line no-param-reassign
      d.isSelected = false;
    });

    this.beforeValueSet(true);
    this.setValue(null, { disableValidation: formReset });
    this.afterValueSet();

    if (formReset) {
      DomUtils.removeClass(this.$allWrappers, 'has-error');
    }

    DomUtils.dispatchEvent(this.$ele, 'reset');
  }

  addOption(data, rerender) {
    if (!data) {
      return;
    }

    this.lastOptionIndex += 1;

    const newOption = this.getOptionObj({
      ...data,
      index: this.lastOptionIndex,
    });

    this.options.push(newOption);
    this.sortedOptions.push(newOption);

    if (rerender) {
      this.visibleOptionsCount += 1;
      this.afterSetOptions();
    }
  }

  removeOption(index) {
    if (!index && index !== 0) {
      return;
    }

    this.options.splice(index, 1);
    this.lastOptionIndex -= 1;
  }

  removeNewOption() {
    const newOption = this.getNewOption();

    if (newOption) {
      this.removeOption(newOption.index);
    }
  }

  sortOptions(options) {
    return options.sort((a, b) => {
      const aIsSelected = a.isSelected || a.isAnySelected;
      const bIsSelected = b.isSelected || b.isAnySelected;

      if (!aIsSelected && !bIsSelected) {
        return 0;
      }

      if (aIsSelected && (!bIsSelected || a.index < b.index)) {
        return -1;
      }

      return 1;
    });
  }

  sortOptionsGroup(options) {
    const sortOptions = this.sortOptions.bind(this);
    const structuredOptions = this.structureOptionGroup(options);

    structuredOptions.forEach((d) => {
      const childOptions = d.options;
      // eslint-disable-next-line no-param-reassign
      d.isAnySelected = childOptions.some((e) => e.isSelected);

      if (d.isAnySelected) {
        sortOptions(childOptions);
      }
    });

    sortOptions(structuredOptions);

    return this.destructureOptionGroup(structuredOptions);
  }

  isOptionVisible({ data, searchValue, hasExactOption, visibleOptionGroupsMapping, searchGroup, searchByStartsWith }) {
    const value = data.value.toLowerCase();
    const label = data.label.toLowerCase();
    const { description, alias } = data;
    let isVisible = searchByStartsWith ? label.startsWith(searchValue) : label.indexOf(searchValue) !== -1;

    if (data.isGroupTitle && (!searchGroup || !isVisible)) {
      isVisible = visibleOptionGroupsMapping[data.index];
    }

    if (!searchByStartsWith && alias && !isVisible) {
      isVisible = alias.indexOf(searchValue) !== -1;
    }

    if (!searchByStartsWith && description && !isVisible) {
      isVisible = description.toLowerCase().indexOf(searchValue) !== -1;
    }

    // eslint-disable-next-line no-param-reassign
    data.isVisible = isVisible;

    if (!hasExactOption) {
      // eslint-disable-next-line no-param-reassign
      hasExactOption = label === searchValue || value === searchValue;
    }

    return {
      isVisible,
      hasExactOption,
    };
  }

  structureOptionGroup(options) {
    const result = [];
    const childOptions = {};

    /** getting all group title */
    options.forEach((d) => {
      if (d.isGroupTitle) {
        const childArray = [];
        // eslint-disable-next-line no-param-reassign
        d.options = childArray;
        childOptions[d.index] = childArray;

        result.push(d);
      }
    });

    /** getting all group options */
    options.forEach((d) => {
      if (d.isGroupOption) {
        childOptions[d.groupIndex].push(d);
      }
    });

    return result;
  }

  destructureOptionGroup(options) {
    let result = [];

    options.forEach((d) => {
      result.push(d);
      result = result.concat(d.options);
    });

    return result;
  }

  serverSearch() {
    DomUtils.removeClass(this.$allWrappers, 'has-no-search-results');
    DomUtils.addClass(this.$allWrappers, 'server-searching');

    this.setSelectedOptions();
    this.onServerSearch(this.searchValue, this);
  }

  removeValue($ele) {
    const { selectedValues } = this;
    const selectedValue = DomUtils.getData($ele, 'value');

    Utils.removeItemFromArray(selectedValues, selectedValue);
    this.setValueMethod(selectedValues);
  }

  focus() {
    this.$wrapper.focus();
  }

  enable() {
    this.$ele.disabled = false;

    this.$ele.removeAttribute('disabled');
    this.$hiddenInput.removeAttribute('disabled');
    DomUtils.setAria(this.$wrapper, 'disabled', false);
  }

  disable() {
    this.$ele.disabled = true;

    this.$ele.setAttribute('disabled', '');
    this.$hiddenInput.setAttribute('disabled', '');
    DomUtils.setAria(this.$wrapper, 'disabled', true);
  }

  validate() {
    if (this.disableValidation) {
      return true;
    }

    let hasError = false;
    const { selectedValues, minValues } = this;

    if (
      this.required &&
      (Utils.isEmpty(selectedValues) ||
        /** required minium options not selected */
        (this.multiple && minValues && selectedValues.length < minValues))
    ) {
      hasError = true;
    }

    DomUtils.toggleClass(this.$allWrappers, 'has-error', hasError);

    return !hasError;
  }

  destroy() {
    const { $ele } = this;
    $ele.virtualSelect = undefined;
    $ele.value = undefined;
    $ele.innerHTML = '';

    if (this.hasDropboxWrapper) {
      this.$dropboxWrapper.remove();
      this.mutationObserver.disconnect();
    }

    if (this.dropboxPopover) {
      this.dropboxPopover.destroy();
    }

    DomUtils.removeClass($ele, 'vscomp-ele');
  }

  createSecureTextElements() {
    this.$secureDiv = document.createElement('div');
    this.$secureText = document.createTextNode('');

    this.$secureDiv.appendChild(this.$secureText);
  }

  secureText(text) {
    if (!text || !this.enableSecureText) {
      return text;
    }

    this.$secureText.nodeValue = text;

    return this.$secureDiv.innerHTML;
  }

  toggleRequired(isRequired) {
    this.required = Utils.convertToBoolean(isRequired);
    this.$ele.required = this.required;
  }

  toggleOptionSelectedState($ele, value) {
    let isSelected = value;

    if (typeof isSelected === 'undefined') {
      isSelected = !DomUtils.hasClass($ele, 'selected');
    }

    DomUtils.toggleClass($ele, 'selected', isSelected);
    DomUtils.setAria($ele, 'selected', isSelected);
  }

  toggleOptionFocusedState($ele, isFocused) {
    if (!$ele) {
      return;
    }

    DomUtils.toggleClass($ele, 'focused', isFocused);

    if (isFocused) {
      DomUtils.setAria(this.$wrapper, 'activedescendant', $ele.id);
    }
  }

  /** static methods - start */
  static init(options) {
    let $eleArray = options.ele;

    if (!$eleArray) {
      return undefined;
    }

    let singleEle = false;

    if (typeof $eleArray === 'string') {
      $eleArray = document.querySelectorAll($eleArray);
      const eleLength = $eleArray.length;

      if (eleLength === 0) {
        return undefined;
      }

      if (eleLength === 1) {
        singleEle = true;
      }
    }

    if ($eleArray.length === undefined || $eleArray.forEach === undefined) {
      $eleArray = [$eleArray];
      singleEle = true;
    }

    const instances = [];
    $eleArray.forEach(($ele) => {
      /** skipping initialization on calling init method multiple times */
      if ($ele.virtualSelect) {
        instances.push($ele.virtualSelect);
        return;
      }

      // eslint-disable-next-line no-param-reassign
      options.ele = $ele;

      if ($ele.tagName === 'SELECT') {
        VirtualSelect.setPropsFromSelect(options);
      }

      instances.push(new VirtualSelect(options));
    });

    return singleEle ? instances[0] : instances;
  }

  static getAttrProps() {
    const { convertPropToDataAttr } = DomUtils;
    const result = {};

    nativeProps.forEach((d) => {
      result[d] = d;
    });

    dataProps.forEach((d) => {
      result[convertPropToDataAttr(d)] = d;
    });

    return result;
  }

  static setPropsFromSelect(props) {
    const $ele = props.ele;
    const disabledOptions = [];
    const selectedValue = [];

    const getNativeOptions = ($container) => {
      const options = [];
      const $options = Array.from($container.children);

      $options.forEach(($option) => {
        const { value } = $option;
        const option = {
          value,
        };

        if ($option.tagName === 'OPTGROUP') {
          option.label = $option.getAttribute('label');
          option.options = getNativeOptions($option);
        } else {
          option.label = $option.innerHTML;
        }

        options.push(option);

        if ($option.disabled) {
          disabledOptions.push(value);
        }

        if ($option.selected) {
          selectedValue.push(value);
        }
      });

      return options;
    };

    const optionsList = getNativeOptions($ele);

    /** creating div element to initiate plugin and removing native element */
    const $newEle = document.createElement('div');

    DomUtils.setAttrFromEle($ele, $newEle, Object.keys(attrPropsMapping), valueLessProps);
    $ele.parentNode.insertBefore($newEle, $ele);
    $ele.remove();

    // eslint-disable-next-line no-param-reassign
    props.ele = $newEle;
    // eslint-disable-next-line no-param-reassign
    props.options = optionsList;
    // eslint-disable-next-line no-param-reassign
    props.disabledOptions = disabledOptions;
    // eslint-disable-next-line no-param-reassign
    props.selectedValue = selectedValue;
  }

  static onFormReset(e) {
    const $form = e.target.closest('form');

    if (!$form) {
      return;
    }

    $form.querySelectorAll('.vscomp-ele-wrapper').forEach(($ele) => {
      $ele.parentElement.virtualSelect.reset(true);
    });
  }

  static onFormSubmit(e) {
    if (!VirtualSelect.validate(e.target.closest('form'))) {
      e.preventDefault();
    }
  }

  static validate($container) {
    if (!$container) {
      return true;
    }

    let hasError = false;

    $container.querySelectorAll('.vscomp-ele-wrapper').forEach(($ele) => {
      const result = $ele.parentElement.virtualSelect.validate();

      if (!hasError && !result) {
        hasError = true;
      }
    });

    return !hasError;
  }

  static reset() {
    this.virtualSelect.reset();
  }

  static setValueMethod(...params) {
    this.virtualSelect.setValueMethod(...params);
  }

  static setOptionsMethod(...params) {
    this.virtualSelect.setOptionsMethod(...params);
  }

  static setDisabledOptionsMethod(...params) {
    this.virtualSelect.setDisabledOptionsMethod(...params);
  }

  static setEnabledOptionsMethod(...params) {
    this.virtualSelect.setEnabledOptionsMethod(...params);
  }

  static toggleSelectAll(isSelected) {
    this.virtualSelect.toggleAllOptions(isSelected);
  }

  static isAllSelected() {
    return this.virtualSelect.isAllSelected;
  }

  static addOptionMethod(data) {
    this.virtualSelect.addOption(data, true);
  }

  static getNewValueMethod() {
    return this.virtualSelect.getNewValue();
  }

  static getDisplayValueMethod() {
    return this.virtualSelect.getDisplayValue();
  }

  static getSelectedOptionsMethod(params) {
    return this.virtualSelect.getSelectedOptions(params);
  }

  static getDisabledOptionsMethod() {
    return this.virtualSelect.getDisabledOptions();
  }

  static openMethod() {
    return this.virtualSelect.openDropbox();
  }

  static closeMethod() {
    return this.virtualSelect.closeDropbox();
  }

  static focusMethod() {
    return this.virtualSelect.focus();
  }

  static enableMethod() {
    return this.virtualSelect.enable();
  }

  static disableMethod() {
    return this.virtualSelect.disable();
  }

  static destroyMethod() {
    return this.virtualSelect.destroy();
  }

  static validateMethod() {
    return this.virtualSelect.validate();
  }

  static toggleRequiredMethod(isRequired) {
    return this.virtualSelect.toggleRequired(isRequired);
  }

  static onResizeMethod() {
    document.querySelectorAll('.vscomp-ele-wrapper').forEach(($ele) => {
      $ele.parentElement.virtualSelect.onResize();
    });
  }
  /** static methods - end */
}

document.addEventListener('reset', VirtualSelect.onFormReset);
document.addEventListener('submit', VirtualSelect.onFormSubmit);
window.addEventListener('resize', VirtualSelect.onResizeMethod);

attrPropsMapping = VirtualSelect.getAttrProps();
window.VirtualSelect = VirtualSelect;

/** polyfill to fix an issue in ie browser */
if (typeof NodeList !== 'undefined' && NodeList.prototype && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
