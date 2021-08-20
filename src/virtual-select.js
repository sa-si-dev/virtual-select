import { Utils, DomUtils } from './utils';

const dropboxCloseButtonFullHeight = 48;
const searchHeight = 40;

const keyDownMethodMapping = {
  13: 'onEnterPress',
  38: 'onUpArrowPress',
  40: 'onDownArrowPress',
};

/** Class representing VirtualSelect */
export class VirtualSelect {
  /**
   * Create a VirtualSelect
   * @property {(element|string)} ele - Parent element to render VirtualSelect
   * @property {string=self} dropboxWrapper - Parent element to render dropbox. (self, body, or any css selectror)
   * Use this when container of dropdown has overflow scroll or hiddden value.
   * @property {object[]} options - Array of object to show as options
   * @property {(string|number)} options[].value - Value of the option
   * @property {(string|number)} options[].label - Display text of the option
   * @property {(string|number)} options[].description - Text to show along with label
   * @property {(string|array)} options[].alias - Alternative labels to use on search. Array of string or comma separated string.
   * @property {array} options[].options - List of options for option group
   * @property {string} [valueKey=value] - Object key to use to get value from options array
   * @property {string} [labelKey=label] - Object key to use to get label from options array
   * @property {string} [descriptionKey=description] - Object key to use to get description from options array
   * @property {string} [aliasKey=alias] - Key name to get alias from options object
   * @property {boolean} [multiple=false] - Enable multiselect
   * @property {boolean} [search=false] - Enable search
   * @property {boolean} [hideClearButton=false] - Hide clear button
   * @property {boolean} [autoSelectFirstOption=false] - Select first option by default on load
   * @property {boolean} [hasOptionDescription=false] - Has description to show along with label
   * @property {boolean} [disableSelectAll=false] - Disable select all feature of multiple select
   * @property {string} [optionsCount=5|4] - No.of options to show on viewport
   * @property {string} [optionHeight=40px|50px] - Height of each dropdown options
   * @property {string} [position=auto] - Position of dropbox (top, bottom, auto)
   * @property {array} [disabledOptions] - Options to disable (array of values)
   * @property {(string|array)} [selectedValue] - Single value or array of values to select on init
   * @property {boolean} [silentInitialValueSet=false] - To avoid "change event" trigger on setting initial value
   * @property {string} [dropboxWidth] - Custom width for dropbox
   * @property {number} [zIndex=1] - CSS z-index value for dropbox
   * @property {number} [noOfDisplayValues=50] - Maximum no.of values to show in the tooltip for multi-select
   * @property {boolean} [allowNewOption=false] - Allow to add new option by searching
   * @property {boolean} [markSearchResults=false] - Mark matched term in label
   * @property {string} [tooltipFontSize=14px] - Font size for tooltip
   * @property {string} [tooltipAlignment=center] - CSS Text alignment for tooltip
   * @property {string} [tooltipMaxWidth=300px] - CSS max width for tooltip
   * @property {boolean} [showSelectedOptionsFirst=false] - Show selected options at the top of the dropbox
   * @property {string} [name] - Name attribute for hidden input
   * @property {boolean} [keepAlwaysOpen] - Keep dropbox always open with fixed height
   * @property {number} [maxValues=0] - Maximum no.of options allowed to choose in multiple select
   * @property {string} [additionalClasses] - Additional classes for wrapper element
   * @property {boolean} [showDropboxAsPopup=true] - Show dropbox as popup on small screen like mobile
   * @property {string} [popupDropboxBreakpoint=576px] - Maximum screen width that allowed to show dropbox as popup
   * @property {function} [onServerSearch] - Callback function to integrate server search
   * @property {function} [labelRenderer] - Callback function to render label, which could be used to add image, icon, or custom content
   * @property {boolean} [hideValueTooltipOnSelectAll=true] - Hide value tooltip if all options selected
   * @property {boolean} [showOptionsOnlyOnSearch=false] - Show options to select only if search value is not empty
   * @property {boolean} [selectAllOnlyVisible=false] - Select only visible options on clicking select all checkbox when options filtered by search
   * @property {boolean} [alwaysShowSelectedOptionsCount=false] - By default, no.of options selected text would be shown
   * when there is no enough space to show all selected values. Set true to override this.
   * @property {boolean} [disableAllOptionsSelectedText=false] - By default, when all values selected "All (10)" value text would be shown.
   * Set true to show value text as "10 options selected".
   * @property {boolean} [showValueAsTags=false] - Show each selected values as tags with remove icon
   *
   * @property {string} [placeholder=Select] - Text to show when no options selected
   * @property {string} [noOptionsText=No options found] - Text to show when no options to show
   * @property {string} [noSearchResultsText=No results found] - Text to show when no results on search
   * @property {string} [selectAllText=Select all] - Text to show near select all checkbox when search is disabled
   * @property {string} [searchPlaceholderText=Search...] - Text to show as placeholder for search input
   * @property {string} [optionsSelectedText=options selected] - Text to use when displaying no.of values selected text (i.e. 3 options selected)
   * @property {string} [optionSelectedText=option selected] - Text to use when displaying no.of values selected text
   * and only one value is selected (i.e. 1 option selected)
   * @property {string} [allOptionsSelectedText=All] - Text to use when displaying all values selected text (i.e. All (10))
   * @property {string} [clearButtonText=Clear] - Tooltip text for clear button
   * @property {string} [moreText=more...] - Text to show when more than noOfDisplayValues options selected (i.e + 10 more...)
   */
  constructor(options) {
    try {
      this.setProps(options);
      this.setDisabledOptions(options.disabledOptions);
      this.setOptions(options.options);
      this.render();
    } catch (e) {
      console.warn(`Couldn't initiate Virtual Select`);
      console.error(e);
    }
  }

  /** render methods - start */
  render() {
    if (!this.$ele) {
      return;
    }

    let wrapperClasses = 'vscomp-wrapper';
    let valueTooltip = this.getTooltipAttrText('', !this.multiple, true);
    let clearButtonTooltip = this.getTooltipAttrText(this.clearButtonText);

    if (this.additionalClasses) {
      wrapperClasses += ' ' + this.additionalClasses;
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

    let html = `<div class="vscomp-ele-wrapper ${wrapperClasses}" tabindex="0">
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
    let $wrapper = this.dropboxWrapper !== 'self' ? document.querySelector(this.dropboxWrapper) : null;

    let dropboxContainerStyle = {
      'z-index': this.zIndex,
    };

    if (!this.showAsPopup) {
      if (this.dropboxWidth) {
        dropboxContainerStyle.width = this.dropboxWidth;
      }
    }

    let html = `<div class="vscomp-dropbox-container" ${DomUtils.getStyleText(dropboxContainerStyle)}>
        <div class="vscomp-dropbox">
          <div class="vscomp-search-wrapper"></div>

          <div class="vscomp-options-container">
            <div class="vscomp-options-loader"></div>

            <div class="vscomp-options-list">
              <div class="vscomp-options"></div>
            </div>
          </div>

          <div class="vscomp-no-options">${this.noOptionsText}</div>
          <div class="vscomp-no-search-results">${this.noSearchResultsText}</div>

          <span class="vscomp-dropbox-close-button"><i class="vscomp-clear-icon"></i></span>
        </div>
      </div>`;

    if ($wrapper) {
      let $dropboxWrapper = document.createElement('div');
      this.$dropboxWrapper = $dropboxWrapper;
      this.hasDropboxWrapper = true;
      $dropboxWrapper.innerHTML = html;

      $wrapper.appendChild($dropboxWrapper);
      DomUtils.addClass($dropboxWrapper, `vscomp-dropbox-wrapper ${wrapperClasses}`);

      return '';
    } else {
      this.hasDropboxWrapper = false;

      return html;
    }
  }

  renderOptions() {
    let html = '';
    let visibleOptions = this.getVisibleOptions();
    let checkboxHtml = '';
    let newOptionIconHtml = '';
    let markSearchResults = this.markSearchResults && this.searchValue ? true : false;
    let searchRegex;
    let labelRenderer = this.labelRenderer;
    let hasLabelRenderer = typeof labelRenderer === 'function';

    let styleText = DomUtils.getStyleText({
      height: this.optionHeight + 'px',
    });

    if (markSearchResults) {
      searchRegex = new RegExp(`(${this.searchValue})`, 'gi');
    }

    if (this.multiple) {
      checkboxHtml = '<span class="checkbox-icon"></span>';
    }

    if (this.allowNewOption) {
      let newOptionTooltip = this.getTooltipAttrText('New Option');
      newOptionIconHtml = `<span class="vscomp-new-option-icon" ${newOptionTooltip}></span>`;
    }

    visibleOptions.forEach((d) => {
      let optionLabel;
      let optionClasses = 'vscomp-option';
      let optionTooltip = this.getTooltipAttrText('', true);
      let leftSection = checkboxHtml;
      let rightSection = '';
      let description = '';

      if (d.isFocused) {
        optionClasses += ' focused';
      }

      if (d.isDisabled) {
        optionClasses += ' disabled';
      }

      if (d.isGroupTitle) {
        optionClasses += ' group-title';
        leftSection = '';
      } else {
        if (d.isSelected) {
          optionClasses += ' selected';
        }
      }

      if (d.isGroupOption) {
        optionClasses += ' group-option';
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
      } else {
        if (markSearchResults && !d.isGroupTitle) {
          optionLabel = optionLabel.replace(searchRegex, '<mark>$1</mark>');
        }
      }

      html += `<div class="${optionClasses}" data-value="${d.value}" data-index="${d.index}" data-visible-index="${d.visibleIndex}" ${styleText}>
          ${leftSection}
          <span class="vscomp-option-text" ${optionTooltip}>
            ${optionLabel}
          </span>
          ${description}
          ${rightSection}
        </div>`;
    });

    this.$options.innerHTML = html;
    let hasNoOptions = !this.options.length && !this.hasServerSearch;
    let hasNoSearchResults = !hasNoOptions && !visibleOptions.length;

    if (!this.allowNewOption || this.hasServerSearch || this.showOptionsOnlyOnSearch) {
      DomUtils.toggleClass(this.$allWrappers, 'has-no-search-results', hasNoSearchResults);
    }

    DomUtils.toggleClass(this.$allWrappers, 'has-no-options', hasNoOptions);
    this.setOptionsPosition();
    this.setOptionsTooltip();
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

    let html = `<div class="vscomp-search-container">
        ${checkboxHtml}
        ${searchInput}
      </div>`;

    this.$search.innerHTML = html;
    this.$searchInput = this.$dropboxContainer.querySelector('.vscomp-search-input');
    this.$searchClear = this.$dropboxContainer.querySelector('.vscomp-search-clear');
    this.$toggleAllButton = this.$dropboxContainer.querySelector('.vscomp-toggle-all-button');
    this.$toggleAllCheckbox = this.$dropboxContainer.querySelector('.vscomp-toggle-all-checkbox');

    this.addEvent(this.$searchInput, 'keyup change', 'onSearch');
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

    events = Utils.removeArrayEmpty(events.split(' '));

    events.forEach((event) => {
      let eventsKey = `${method}-${event}`;
      let callback = this.events[eventsKey];

      if (!callback) {
        callback = this[method].bind(this);
        this.events[eventsKey] = callback;
      }

      DomUtils.addEvent($ele, event, callback);
    });
  }

  onDocumentClick(e) {
    let $eleToKeepOpen = e.target.closest('.vscomp-wrapper');

    if ($eleToKeepOpen !== this.$wrapper && $eleToKeepOpen !== this.$dropboxWrapper && this.isOpened()) {
      this.closeDropbox();
    }
  }

  onKeyDown(e) {
    let key = e.which || e.keyCode;
    let method = keyDownMethodMapping[key];

    if (method) {
      this[method](e);
    }
  }

  onEnterPress() {
    if (!this.isOpened()) {
      this.openDropbox();
    } else {
      this.selectFocusedOption();
    }
  }

  onDownArrowPress(e) {
    e.preventDefault();

    if (this.isOpened()) {
      this.focusOption('next');
    } else {
      this.openDropbox();
    }
  }

  onUpArrowPress(e) {
    e.preventDefault();

    if (this.isOpened()) {
      this.focusOption('previous');
    } else {
      this.openDropbox();
    }
  }

  onToggleButtonClick(e) {
    let $target = e.target;

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
    this.selectOption(e.target.closest('.vscomp-option:not(.disabled):not(.group-title)'));
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
    let $ele = e.target.closest('.vscomp-option:not(.disabled):not(.group-title)');

    if ($ele && this.isOpened()) {
      this.focusOption(null, $ele);
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
      mutations.some((mutation) => {
        const $removedNodes = [...mutation.removedNodes];

        const isMatching = $removedNodes.some(($ele) => {
          if ($ele === $vscompEle || $ele.contains($vscompEle)) {
            return true;
          }
        });

        if (isMatching) {
          this.destroy();
        }

        return isMatching;
      });
    });

    this.mutationObserver.observe(document.querySelector('body'), { childList: true, subtree: true });
  }
  /** dom event methods - end */

  /** before event methods - start */
  beforeValueSet(isReset) {
    this.toggleAllOptionsClass(isReset ? false : undefined);
  }

  beforeSelectNewValue() {
    let newOption = this.getNewOption();
    let newIndex = newOption.index;

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
    DomUtils.setAttr(this.$ele, 'name', this.name);
    DomUtils.addClass(this.$ele, 'vscomp-ele');

    this.renderSearch();
    this.setOptionsHeight();
    this.setVisibleOptions();
    this.setOptionsContainerHeight();
    this.addEvents();
    this.setMethods();

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
  }

  afterSetOptionsContainerHeight(reset) {
    if (reset) {
      if (this.showAsPopup) {
        this.setVisibleOptions();
      }
    }
  }

  afterSetSearchValue() {
    if (this.hasServerSearch) {
      this.serverSearch();
    } else {
      this.setVisibleOptionsCount();
    }

    if (this.selectAllOnlyVisible) {
      this.toggleAllOptionsClass();
    }
  }

  afterSetVisibleOptionsCount() {
    this.scrollToTop();
    this.setOptionsHeight();
    this.setVisibleOptions();
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
  setProps(options) {
    options = this.setDefaultProps(options);
    this.setPropsFromElementAttr(options);

    let convertToBoolean = Utils.convertToBoolean;

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
    this.disableAllOptionsSelectedText = convertToBoolean(options.disableAllOptionsSelectedText);
    this.showValueAsTags = convertToBoolean(options.showValueAsTags);
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
    this.dropboxWidth = options.dropboxWidth;
    this.tooltipFontSize = options.tooltipFontSize;
    this.tooltipAlignment = options.tooltipAlignment;
    this.tooltipMaxWidth = options.tooltipMaxWidth;
    this.noOfDisplayValues = parseInt(options.noOfDisplayValues);
    this.zIndex = parseInt(options.zIndex);
    this.maxValues = parseInt(options.maxValues);
    this.name = options.name;
    this.additionalClasses = options.additionalClasses;
    this.popupDropboxBreakpoint = options.popupDropboxBreakpoint;
    this.onServerSearch = options.onServerSearch;
    this.labelRenderer = options.labelRenderer;
    this.initialSelectedValue = options.selectedValue === 0 ? '0' : options.selectedValue;

    this.selectedValues = [];
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
    }

    if (this.keepAlwaysOpen) {
      this.dropboxWrapper = 'self';
    }

    this.showAsPopup = this.showDropboxAsPopup && !this.keepAlwaysOpen && window.innerWidth <= parseFloat(this.popupDropboxBreakpoint);
    this.hasSearchContainer = this.hasSearch || (this.multiple && !this.disableSelectAll);
    this.optionsCount = this.getOptionsCount(options.optionsCount);
    this.halfOptionsCount = Math.ceil(this.optionsCount / 2);
    this.optionsHeight = this.getOptionsHeight();
  }

  setDefaultProps(options) {
    let defaultOptions = {
      dropboxWrapper: 'self',
      valueKey: 'value',
      labelKey: 'label',
      descriptionKey: 'description',
      aliasKey: 'alias',
      optionsCount: 5,
      noOfDisplayValues: 50,
      optionHeight: '40px',
      multiple: false,
      hideClearButton: false,
      autoSelectFirstOption: false,
      hasOptionDescription: false,
      silentInitialValueSet: false,
      disableSelectAll: false,
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
      position: 'auto',
      zIndex: options.keepAlwaysOpen ? 1 : 2,
      allowNewOption: false,
      markSearchResults: false,
      tooltipFontSize: '14px',
      tooltipAlignment: 'center',
      tooltipMaxWidth: '300px',
      showSelectedOptionsFirst: false,
      name: '',
      additionalClasses: '',
      keepAlwaysOpen: false,
      maxValues: 0,
      showDropboxAsPopup: true,
      popupDropboxBreakpoint: '576px',
      hideValueTooltipOnSelectAll: true,
      showOptionsOnlyOnSearch: false,
      selectAllOnlyVisible: false,
      alwaysShowSelectedOptionsCount: false,
      disableAllOptionsSelectedText: false,
      showValueAsTags: false,
    };

    if (options.hasOptionDescription) {
      defaultOptions.optionsCount = 4;
      defaultOptions.optionHeight = '50px';
    }

    return Object.assign(defaultOptions, options);
  }

  setPropsFromElementAttr(options) {
    let $ele = options.ele;
    let mapping = {
      multiple: 'multiple',
      placeholder: 'placeholder',
      name: 'name',
      'data-dropbox-wrapper': 'dropboxWrapper',
      'data-value-key': 'valueKey',
      'data-label-key': 'labelKey',
      'data-description-key': 'descriptionKey',
      'data-alias-key': 'aliasKey',
      'data-search': 'search',
      'data-hide-clear-button': 'hideClearButton',
      'data-auto-select-first-option': 'autoSelectFirstOption',
      'data-has-option-description': 'hasOptionDescription',
      'data-options-count': 'optionsCount',
      'data-option-height': 'optionHeight',
      'data-position': 'position',
      'data-no-options-text': 'noOptionsText',
      'data-no-search-results-text': 'noSearchResultsText',
      'data-select-all-text': 'selectAllText',
      'data-search-placeholder-text': 'searchPlaceholderText',
      'data-options-selected-text': 'optionsSelectedText',
      'data-option-selected-text': 'optionSelectedText',
      'data-all-options-selected-text': 'allOptionsSelectedText',
      'data-clear-button-text': 'clearButtonText',
      'data-more-text': 'moreText',
      'data-silent-initial-value-set': 'silentInitialValueSet',
      'data-dropbox-width': 'dropboxWidth',
      'data-z-index': 'zIndex',
      'data-no-of-display-values': 'noOfDisplayValues',
      'data-allow-new-option': 'allowNewOption',
      'data-mark-search-results': 'markSearchResults',
      'data-tooltip-font-size': 'tooltipFontSize',
      'data-tooltip-alignment': 'tooltipAlignment',
      'data-tooltip-max-width': 'tooltipMaxWidth',
      'data-show-selected-options-first': 'showSelectedOptionsFirst',
      'data-disable-select-all': 'disableSelectAll',
      'data-keep-always-open': 'keepAlwaysOpen',
      'data-max-values': 'maxValues',
      'data-additional-classes': 'additionalClasses',
      'data-show-dropbox-as-popup': 'showDropboxAsPopup',
      'data-popup-dropbox-breakpoint': 'popupDropboxBreakpoint',
      'data-hide-value-tooltip-on-select-all': 'hideValueTooltipOnSelectAll',
      'data-show-options-only-on-search': 'showOptionsOnlyOnSearch',
      'data-select-all-only-visible': 'selectAllOnlyVisible',
      'data-always-show-selected-options-count': 'alwaysShowSelectedOptionsCount',
      'data-disable-all-options-selected-text': 'disableAllOptionsSelectedText',
      'data-show-value-as-tags': 'showValueAsTags',
    };

    for (let k in mapping) {
      let value = $ele.getAttribute(k);

      if (k === 'multiple' && (value === '' || value === 'true')) {
        value = true;
      }

      if (value) {
        options[mapping[k]] = value;
      }
    }
  }

  setMethods() {
    let $ele = this.$ele;
    $ele.virtualSelect = this;
    $ele.value = this.multiple ? [] : '';
    $ele.reset = VirtualSelect.reset;
    $ele.setValue = VirtualSelect.setValueMethod;
    $ele.setOptions = VirtualSelect.setOptionsMethod;
    $ele.setDisabledOptions = VirtualSelect.setDisabledOptionsMethod;
    $ele.toggleSelectAll = VirtualSelect.toggleSelectAll;
    $ele.isAllSelected = VirtualSelect.isAllSelected;
    $ele.addOption = VirtualSelect.addOptionMethod;
    $ele.getNewValue = VirtualSelect.getNewValueMethod;
    $ele.getDisplayValue = VirtualSelect.getDisplayValueMethod;
    $ele.getSelectedOptions = VirtualSelect.getSelectedOptionsMethod;
    $ele.open = VirtualSelect.openMethod;
    $ele.close = VirtualSelect.closeMethod;
    $ele.destroy = VirtualSelect.destroyMethod;

    if (this.hasDropboxWrapper) {
      this.$dropboxWrapper.virtualSelect = this;
    }
  }

  setValueMethod(value, silentChange) {
    if (!Array.isArray(value)) {
      value = [value];
    }

    value = value.map((v) => {
      return v || v == 0 ? v.toString() : '';
    });

    let validValues = [];

    if (this.allowNewOption && value) {
      this.setNewOptionsFromValue(value);
    }

    let valuesMapping = {};

    value.forEach((d) => {
      valuesMapping[d] = true;
    });

    this.options.forEach((d) => {
      if (valuesMapping[d.value] === true && !d.isDisabled && !d.isGroupTitle) {
        d.isSelected = true;
        validValues.push(d.value);
      } else {
        d.isSelected = false;
      }
    });

    if (!this.multiple) {
      validValues = validValues[0];
    }

    this.beforeValueSet();
    this.setValue(validValues, !silentChange);
    this.afterValueSet();
  }

  setOptionsMethod(options, keepValue) {
    this.setOptions(options);
    this.afterSetOptions(keepValue);
  }

  setDisabledOptionsMethod(disabledOptions) {
    this.setDisabledOptions(disabledOptions, true);
    this.setValueMethod(null);
    this.setVisibleOptions();
  }

  setDisabledOptions(disabledOptions = [], setOptionsProp = false) {
    disabledOptions = disabledOptions.map((d) => d.toString());
    this.disabledOptions = disabledOptions;

    let disabledOptionsMapping = {};

    disabledOptions.forEach((d) => {
      disabledOptionsMapping[d] = true;
    });

    if (setOptionsProp && disabledOptions.length) {
      this.options.forEach((d) => {
        d.isDisabled = disabledOptionsMapping[d.value] === true;

        return d;
      });
    }
  }

  setOptions(options) {
    if (!options) {
      options = [];
    }

    let preparedOptions = [];
    let hasDisabledOptions = this.disabledOptions.length;
    let valueKey = this.valueKey;
    let labelKey = this.labelKey;
    let descriptionKey = this.descriptionKey;
    let aliasKey = this.aliasKey;
    let hasOptionDescription = this.hasOptionDescription;
    let getString = Utils.getString;
    let convertToBoolean = Utils.convertToBoolean;
    let getAlias = this.getAlias;
    let index = 0;
    let hasOptionGroup = false;
    let disabledOptionsMapping = {};

    this.disabledOptions.forEach((d) => {
      disabledOptionsMapping[d] = true;
    });

    let prepareOption = (d) => {
      let value = getString(d[valueKey]);
      let childOptions = d.options;
      let isGroupTitle = childOptions ? true : false;
      let option = {
        index,
        value,
        label: getString(d[labelKey]),
        alias: getAlias(d[aliasKey]),
        isVisible: convertToBoolean(d.isVisible, true),
        isNew: d.isNew || false,
        isGroupTitle,
      };

      if (hasDisabledOptions) {
        option.isDisabled = disabledOptionsMapping[value] === true;
      }

      if (d.isGroupOption) {
        option.isGroupOption = true;
        option.groupIndex = d.groupIndex;
      }

      if (hasOptionDescription) {
        option.description = getString(d[descriptionKey]);
      }

      preparedOptions.push(option);
      index++;

      if (isGroupTitle) {
        let groupIndex = option.index;
        hasOptionGroup = true;

        childOptions.forEach((d) => {
          d.isGroupOption = true;
          d.groupIndex = groupIndex;

          prepareOption(d);
        });
      }
    };

    options.forEach(prepareOption);

    this.options = preparedOptions;
    this.visibleOptionsCount = preparedOptions.length;
    this.lastOptionIndex = this.options.length - 1;
    this.newValues = [];
    this.hasOptionGroup = hasOptionGroup;
    this.setSortedOptions();
  }

  setServerOptions(options = []) {
    this.setOptionsMethod(options, true);

    let selectedOptions = this.selectedOptions;
    let newOptions = this.options;
    let optionsUpdated = false;

    /** merging already seleted options details with new options */
    if (selectedOptions.length) {
      let newOptionsValueMapping = {};
      optionsUpdated = true;

      newOptions.forEach((d) => {
        newOptionsValueMapping[d.value] = true;
      });

      selectedOptions.forEach((d) => {
        if (newOptionsValueMapping[d.value] === false) {
          d.isVisible = false;
          newOptions.push(d);
        }
      });

      this.setOptionsMethod(newOptions, true);
    }

    /** merging new search option */
    if (this.allowNewOption && this.searchValue) {
      let hasExactOption = newOptions.some((d) => d.label.toLowerCase() === this.searchValue);

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
    }

    DomUtils.removeClass(this.$allWrappers, 'server-searching');
  }

  setSelectedOptions() {
    let valuesMapping = {};

    this.selectedValues.forEach((d) => {
      valuesMapping[d] = true;
    });

    this.selectedOptions = this.options.filter((d) => valuesMapping[d.value] === true);
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
    let maxOptionsToShow = this.optionsCount * 2;
    let startIndex = this.getVisibleStartIndex();
    let newOption = this.getNewOption();
    let endIndex = startIndex + maxOptionsToShow - 1;
    let i = 0;

    if (newOption) {
      newOption.visibleIndex = i;
      i++;
    }

    visibleOptions = visibleOptions.filter((d) => {
      let inView = false;

      if (d.isVisible && !d.isCurrentNew) {
        inView = i >= startIndex && i <= endIndex;
        d.visibleIndex = i;
        i++;
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
    if (startIndex === undefined) {
      startIndex = this.getVisibleStartIndex();
    }

    let top = startIndex * this.optionHeight;
    this.$options.style.transform = `translate3d(0, ${top}px, 0)`;
    DomUtils.setData(this.$options, 'top', top);
  }

  setOptionsTooltip() {
    let visibleOptions = this.getVisibleOptions();
    let hasOptionDescription = this.hasOptionDescription;

    visibleOptions.forEach((d) => {
      let $optionEle = this.$dropboxContainer.querySelector(`.vscomp-option[data-index="${d.index}"]`);

      DomUtils.setData($optionEle.querySelector('.vscomp-option-text'), 'tooltip', d.label);

      if (hasOptionDescription) {
        DomUtils.setData($optionEle.querySelector('.vscomp-option-description'), 'tooltip', d.description);
      }
    });
  }

  setValue(value, triggerEvent) {
    if (!value) {
      this.selectedValues = [];
    } else if (Array.isArray(value)) {
      this.selectedValues = [...value];
    } else {
      this.selectedValues = [value];
    }

    let newValue = this.multiple ? this.selectedValues : this.selectedValues[0] || '';
    this.$ele.value = newValue;
    this.$hiddenInput.value = newValue;
    this.isMaxValuesSelected = this.maxValues && this.maxValues <= this.selectedValues.length ? true : false;
    this.setValueText();
    DomUtils.toggleClass(this.$allWrappers, 'has-value', Utils.isNotEmpty(this.selectedValues));
    DomUtils.toggleClass(this.$allWrappers, 'max-value-selected', this.isMaxValuesSelected);

    if (triggerEvent) {
      DomUtils.dispatchEvent(this.$ele, 'change');
    }
  }

  setValueText() {
    let valueText = [];
    let valueTooltip = [];
    let selectedValues = this.selectedValues;
    let selectedLength = selectedValues.length;
    let noOfDisplayValues = this.noOfDisplayValues;
    let showValueAsTags = this.showValueAsTags;
    let $valueText = this.$valueText;
    let maximumValuesToShow = 50;
    let selectedValuesCount = 0;
    let showAllText = this.isAllSelected && !this.hasServerSearch && !this.disableAllOptionsSelectedText && !showValueAsTags;

    /** show all values selected text without tooltip text */
    if (showAllText && this.hideValueTooltipOnSelectAll) {
      $valueText.innerHTML = `${this.allOptionsSelectedText} (${selectedLength})`;
    } else {
      let valuesMapping = {};

      selectedValues.forEach((d) => {
        valuesMapping[d] = true;
      });

      for (let d of this.options) {
        if (d.isCurrentNew) {
          continue;
        }

        if (selectedValuesCount > maximumValuesToShow) {
          break;
        }

        let value = d.value;

        if (valuesMapping[value] === true) {
          let label = d.label;
          valueText.push(label);
          selectedValuesCount++;

          if (selectedValuesCount <= noOfDisplayValues) {
            if (showValueAsTags) {
              let valueTagHtml = `<span class="vscomp-value-tag" data-value="${value}">
                  <span class="vscomp-value-tag-content">${label}</span>
                  <span class="vscomp-value-tag-clear-button">
                    <i class="vscomp-clear-icon"></i>
                  </span>
                </span>`;

              valueTooltip.push(valueTagHtml);
            } else {
              valueTooltip.push(label);
            }
          }
        }
      }

      let moreSelectedOptions = selectedLength - noOfDisplayValues;

      if (moreSelectedOptions > 0) {
        valueTooltip.push(`<span class="vscomp-value-tag more-value-count">+ ${moreSelectedOptions} ${this.moreText}</span>`);
      }

      const aggregatedValueText = valueText.join(', ');

      if (aggregatedValueText === '') {
        $valueText.innerHTML = this.placeholder;
      } else {
        $valueText.innerHTML = aggregatedValueText;

        if (this.multiple) {
          let maxValues = this.maxValues;

          if (DomUtils.hasEllipsis($valueText) || maxValues || this.alwaysShowSelectedOptionsCount || showValueAsTags) {
            let countText = `<span class="vscomp-selected-value-count">${selectedLength}</span>`;

            if (maxValues) {
              countText += ` / <span class="vscomp-max-value-count">${maxValues}</span>`;
            }

            /** show all values selected text with tooltip text */
            if (showAllText) {
              $valueText.innerHTML = `${this.allOptionsSelectedText} (${selectedLength})`;
            } else if (showValueAsTags) {
              $valueText.innerHTML = valueTooltip.join('');
            } else {
              /** replace comma delimitted list of selections with shorter text indicating selection count */
              let optionsSelectedText = selectedLength === 1 ? this.optionSelectedText : this.optionsSelectedText;
              $valueText.innerHTML = `${countText} ${optionsSelectedText}`;
            }
          } else {
            /** removing tooltip if full value text is visible */
            valueTooltip = [];
          }
        }
      }
    }

    if (!showValueAsTags) {
      DomUtils.setData($valueText, 'tooltip', valueTooltip.join(', '));
    }
  }

  setSearchValue(value, skipInputSet = false, forceSet = false) {
    if (value === this.searchValueOriginal && !forceSet) {
      return;
    }

    if (!skipInputSet) {
      this.$searchInput.value = value;
    }

    let searchValue = value.replace(/\\/g, '').toLowerCase().trim();
    this.searchValue = searchValue;
    this.searchValueOriginal = value;

    DomUtils.toggleClass(this.$allWrappers, 'has-search-value', value);

    this.afterSetSearchValue();
  }

  setVisibleOptionsCount() {
    let visibleOptionsCount = 0;
    let hasExactOption = false;
    let visibleOptionGroupsMapping;
    let searchValue = this.searchValue;
    let showOptionsOnlyOnSearch = this.showOptionsOnlyOnSearch;
    let isOptionVisible = this.isOptionVisible.bind(this);

    if (this.hasOptionGroup) {
      visibleOptionGroupsMapping = this.getVisibleOptionGroupsMapping(searchValue);
    }

    this.options.forEach((d) => {
      if (d.isCurrentNew) {
        return;
      }

      let result;

      if (showOptionsOnlyOnSearch && !searchValue) {
        d.isVisible = false;
        result = {
          isVisible: false,
          hasExactOption: false,
        };
      } else {
        result = isOptionVisible(d, searchValue, hasExactOption, visibleOptionGroupsMapping);
      }

      if (result.isVisible) {
        visibleOptionsCount++;
      }

      if (!hasExactOption) {
        hasExactOption = result.hasExactOption;
      }
    });

    if (this.allowNewOption) {
      if (searchValue && !hasExactOption) {
        this.setNewOption();
        visibleOptionsCount++;
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
    this.$optionsList.style.height = this.optionHeight * this.visibleOptionsCount + 'px';
  }

  setOptionsContainerHeight(reset) {
    let optionsHeight;

    if (reset) {
      if (this.showAsPopup) {
        this.optionsCount = this.getOptionsCount();
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
    let value = newValue || this.searchValueOriginal.trim();

    if (!value) {
      return;
    }

    let newOption = this.getNewOption();

    if (newOption) {
      let newIndex = newOption.index;

      this.setOptionProp(newIndex, 'value', value);
      this.setOptionProp(newIndex, 'label', value);
    } else {
      let data = {
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
    let valuesMapping = {};

    this.selectedValues.forEach((d) => {
      valuesMapping[d] = true;
    });

    this.options.forEach((d) => {
      if (valuesMapping[d.value] === true) {
        d.isSelected = true;
      }
    });
  }

  setNewOptionsFromValue(values) {
    if (!values) {
      return;
    }

    let setNewOption = this.setNewOption.bind(this);
    let availableValuesMapping = {};

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

    let width = this.dropboxWidth || `${this.$wrapper.offsetWidth}px`;

    DomUtils.setStyle(this.$dropboxContainer, 'max-width', width);
  }
  /** set methods - end */

  /** get methods - start */
  getVisibleOptions() {
    return this.visibleOptions || [];
  }

  getValue() {
    return this.multiple ? this.selectedValues : this.selectedValues[0];
  }

  getFirstVisibleOptionIndex() {
    return Math.ceil(this.$optionsContainer.scrollTop / this.optionHeight);
  }

  getVisibleStartIndex() {
    let firstVisibleOptionIndex = this.getFirstVisibleOptionIndex();
    let startIndex = firstVisibleOptionIndex - this.halfOptionsCount;

    if (startIndex < 0) {
      startIndex = 0;
    }

    return startIndex;
  }

  getTooltipAttrText(text, ellipsisOnly = false, allowHtml = false) {
    let data = {
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

  getOptionObj(data) {
    if (!data) {
      return;
    }

    let getString = Utils.getString;
    let newOption = {
      index: data.index,
      value: getString(data.value),
      label: getString(data.label),
      description: getString(data.description),
      alias: this.getAlias(data.alias),
      isCurrentNew: data.isCurrentNew || false,
      isNew: data.isNew || false,
      isVisible: true,
    };

    return newOption;
  }

  getNewOption() {
    let lastOption = this.options[this.lastOptionIndex];

    if (!lastOption || !lastOption.isCurrentNew) {
      return;
    }

    return lastOption;
  }

  getOptionIndex(value) {
    let index;

    if (value) {
      this.options.some((d) => {
        if (d.value == value) {
          index = d.index;

          return true;
        }
      });
    }

    return index;
  }

  getNewValue() {
    let valuesMapping = {};

    this.newValues.forEach((d) => {
      valuesMapping[d] = true;
    });

    let result = this.selectedValues.filter((d) => valuesMapping[d] === true);

    return this.multiple ? result : result[0];
  }

  getAlias(alias) {
    if (alias) {
      if (Array.isArray(alias)) {
        alias = alias.join(',');
      } else {
        alias = alias.toString().trim();
      }

      alias = alias.toLowerCase();
    } else {
      alias = '';
    }

    return alias;
  }

  getDisplayValue() {
    let displayValues = [];
    let valuesMapping = {};

    this.selectedValues.forEach((d) => {
      valuesMapping[d] = true;
    });

    this.options.forEach((d) => {
      if (valuesMapping[d.value] === true) {
        displayValues.push(d.label);
      }
    });

    return this.multiple ? displayValues : displayValues[0] || '';
  }

  getSelectedOptions() {
    let valueKey = this.valueKey;
    let labelKey = this.labelKey;
    let selectedOptions = [];
    let valuesMapping = {};

    this.selectedValues.forEach((d) => {
      valuesMapping[d] = true;
    });

    this.options.forEach((d) => {
      if (valuesMapping[d.value] === true) {
        let data = {
          [valueKey]: d.value,
          [labelKey]: d.label,
        };

        if (d.isNew) {
          data.isNew = true;
        }

        selectedOptions.push(data);
      }
    });

    return this.multiple ? selectedOptions : selectedOptions[0];
  }

  getVisibleOptionGroupsMapping(searchValue) {
    let options = this.options;
    let result = {};
    let isOptionVisible = this.isOptionVisible;
    options = this.structureOptionGroup(options);

    options.forEach((d) => {
      result[d.index] = d.options.some((e) => isOptionVisible(e, searchValue).isVisible);
    });

    return result;
  }

  getOptionsCount(count) {
    if (this.showAsPopup) {
      let availableHeight = (window.innerHeight * 80) / 100 - dropboxCloseButtonFullHeight;

      if (this.hasSearchContainer) {
        availableHeight -= searchHeight;
      }

      count = Math.floor(availableHeight / this.optionHeight);
    } else {
      count = parseInt(count);
    }

    return count;
  }

  getOptionsHeight() {
    return this.optionsCount * this.optionHeight + 'px';
  }

  getSibling($ele, direction) {
    let propName = direction === 'next' ? 'nextElementSibling' : 'previousElementSibling';

    do {
      if ($ele) {
        $ele = $ele[propName];
      }
    } while (DomUtils.hasClass($ele, 'disabled') || DomUtils.hasClass($ele, 'group-title'));

    return $ele;
  }
  /** get methods - end */

  initDropboxPopover() {
    let data = {
      ele: this.$ele,
      target: this.$dropboxContainer,
      position: this.position,
      zIndex: this.zIndex,
      margin: 4,
      transitionDistance: 30,
      hideArrowIcon: true,
      disableManualAction: true,
      disableUpdatePosition: !this.hasDropboxWrapper,
      afterShow: this.afterShowPopper.bind(this),
      afterHide: this.afterHidePopper.bind(this),
    };

    this.dropboxPopover = new PopoverComponent(data);
  }

  openDropbox(isSilent) {
    this.isSilentOpen = isSilent;

    if (!isSilent) {
      DomUtils.dispatchEvent(this.$ele, 'beforeOpen');
    }

    this.setDropboxWrapperWidth();

    DomUtils.removeClass(this.$allWrappers, 'closed');

    if (this.dropboxPopover) {
      this.dropboxPopover.show();
    } else {
      this.afterShowPopper();
    }
  }

  afterShowPopper() {
    let isSilent = this.isSilentOpen;
    this.isSilentOpen = false;

    if (!isSilent) {
      this.moveSelectedOptionsFirst();
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

    if (!isSilent) {
      DomUtils.dispatchEvent(this.$ele, 'beforeClose');
    }

    if (this.dropboxPopover) {
      this.dropboxPopover.hide();
    } else {
      this.afterHidePopper();
    }
  }

  afterHidePopper() {
    let isSilent = this.isSilentClose;
    this.isSilentClose = false;

    DomUtils.removeClass(this.$allWrappers, 'focused');
    this.removeOptionFocus();

    if (!isSilent) {
      if (this.isPopupActive) {
        DomUtils.removeClass(this.$body, 'vscomp-popup-active');
        this.isPopupActive = false;
      }
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

  isOpened() {
    return !DomUtils.hasClass(this.$wrapper, 'closed');
  }

  focusSearchInput() {
    let $ele = this.$searchInput;

    if ($ele) {
      $ele.focus();
    }
  }

  focusOption(direction, ele) {
    let $focusedEle = this.$dropboxContainer.querySelector('.vscomp-option.focused');
    let $newFocusedEle;

    if (ele) {
      $newFocusedEle = ele;
    } else if (!$focusedEle) {
      /* if no element on focus choose first visible one */
      let firstVisibleOptionIndex = this.getFirstVisibleOptionIndex();
      $newFocusedEle = this.$dropboxContainer.querySelector(`.vscomp-option[data-visible-index="${firstVisibleOptionIndex}"]`);

      if (DomUtils.hasClass($newFocusedEle, 'disabled') || DomUtils.hasClass($newFocusedEle, 'group-title')) {
        $newFocusedEle = this.getSibling($newFocusedEle, 'next');
      }
    } else {
      $newFocusedEle = this.getSibling($focusedEle, direction);
    }

    if ($newFocusedEle && $newFocusedEle !== $focusedEle) {
      if ($focusedEle) {
        DomUtils.removeClass($focusedEle, 'focused');
      }

      DomUtils.addClass($newFocusedEle, 'focused');
      this.toggleFocusedProp(DomUtils.getData($newFocusedEle, 'index'), true);
      this.moveFocusedOptionToView($newFocusedEle);
    }
  }

  moveFocusedOptionToView($focusedEle) {
    if (!$focusedEle) {
      $focusedEle = this.$dropboxContainer.querySelector('.vscomp-option.focused');
    }

    if (!$focusedEle) {
      return;
    }

    let newScrollTop;
    let containerRect = this.$optionsContainer.getBoundingClientRect();
    let optionRect = $focusedEle.getBoundingClientRect();
    let containerTop = containerRect.top;
    let containerBottom = containerRect.bottom;
    let containerHeight = containerRect.height;
    let optionTop = optionRect.top;
    let optionBottom = optionRect.bottom;
    let optionHeight = optionRect.height;
    let optionOffsetTop = $focusedEle.offsetTop;
    let optionsTop = DomUtils.getData(this.$options, 'top', 'number');

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
    let $focusedEle = this.$dropboxContainer.querySelector('.vscomp-option.focused');

    if (!$focusedEle) {
      return;
    }

    DomUtils.removeClass($focusedEle, 'focused');
    this.toggleFocusedProp(null);
  }

  selectOption($ele) {
    if (!$ele) {
      return;
    }

    let isAdding = !DomUtils.hasClass($ele, 'selected');

    if (isAdding) {
      if (this.multiple && this.isMaxValuesSelected) {
        return;
      }
    } else {
      /** on selecting same value in single select */
      if (!this.multiple) {
        this.closeDropbox();
        return;
      }
    }

    let selectedValues = this.selectedValues;
    let selectedValue = DomUtils.getData($ele, 'value');
    let selectedIndex = DomUtils.getData($ele, 'index');

    this.toggleSelectedProp(selectedIndex, isAdding);

    if (isAdding) {
      if (this.multiple) {
        selectedValues.push(selectedValue);
        this.toggleAllOptionsClass();
      } else {
        if (selectedValues.length) {
          this.toggleSelectedProp(this.getOptionIndex(selectedValues[0]), false);
        }

        selectedValues = [selectedValue];
        let $prevSelectedOption = this.$dropboxContainer.querySelector('.vscomp-option.selected');

        if ($prevSelectedOption) {
          DomUtils.toggleClass($prevSelectedOption, 'selected', false);
        }

        this.closeDropbox();
      }

      DomUtils.toggleClass($ele, 'selected');
    } else {
      if (this.multiple) {
        DomUtils.toggleClass($ele, 'selected');
        Utils.removeItemFromArray(selectedValues, selectedValue);
        this.toggleAllOptionsClass(false);
      }
    }

    if (DomUtils.hasClass($ele, 'current-new')) {
      this.beforeSelectNewValue();
    }

    this.setValue(selectedValues, true);
  }

  selectFocusedOption() {
    this.selectOption(this.$dropboxContainer.querySelector('.vscomp-option.focused'));
  }

  toggleAllOptions(isSelected) {
    if (!this.multiple || this.disableSelectAll) {
      return;
    }

    if (typeof isSelected !== 'boolean') {
      isSelected = !DomUtils.hasClass(this.$toggleAllCheckbox, 'checked');
    }

    let selectedValues = [];
    let selectAllOnlyVisible = this.selectAllOnlyVisible;

    this.options.forEach((d) => {
      if (d.isDisabled || d.isCurrentNew || d.isGroupTitle) {
        return;
      }

      if (!isSelected || (selectAllOnlyVisible && !d.isVisible)) {
        d.isSelected = false;
      } else {
        d.isSelected = true;

        selectedValues.push(d.value);
      }
    });

    this.toggleAllOptionsClass(isSelected);
    this.setValue(selectedValues, true);
    this.renderOptions();
  }

  toggleAllOptionsClass(isAllSelected) {
    if (!this.multiple) {
      return;
    }

    var valuePassed = typeof isAllSelected === 'boolean';

    if (!valuePassed) {
      isAllSelected = this.isAllOptionsSelected();
    }

    DomUtils.toggleClass(this.$toggleAllCheckbox, 'checked', isAllSelected);

    if (this.selectAllOnlyVisible && valuePassed) {
      this.isAllSelected = this.isAllOptionsSelected();
    } else {
      this.isAllSelected = isAllSelected;
    }
  }

  isAllOptionsSelected() {
    let isAllSelected = false;

    if (this.options.length) {
      isAllSelected = !this.options.some((d) => {
        return !d.isSelected && !d.isDisabled && !d.isGroupTitle;
      });
    }

    return isAllSelected;
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
    let isClosed = !this.isOpened();

    if (isClosed) {
      this.openDropbox(true);
    }

    let scrollTop = this.$optionsContainer.scrollTop;

    if (scrollTop > 0) {
      this.$optionsContainer.scrollTop = 0;
    }

    if (isClosed) {
      this.closeDropbox(true);
    }
  }

  reset() {
    this.options.forEach((d) => {
      d.isSelected = false;
    });

    this.beforeValueSet(true);
    this.setValue(null, true);
    this.afterValueSet();

    DomUtils.dispatchEvent(this.$ele, 'reset');
  }

  addOption(data, rerender) {
    if (!data) {
      return;
    }

    this.lastOptionIndex++;
    data.index = this.lastOptionIndex;
    let newOption = this.getOptionObj(data);

    this.options.push(newOption);
    this.sortedOptions.push(newOption);

    if (rerender) {
      this.visibleOptionsCount++;
      this.afterSetOptions();
    }
  }

  removeOption(index) {
    if (!index && index != 0) {
      return;
    }

    this.options.splice(index, 1);
    this.lastOptionIndex--;
  }

  removeNewOption() {
    let newOption = this.getNewOption();

    if (newOption) {
      this.removeOption(newOption.index);
    }
  }

  sortOptions(options) {
    return options.sort((a, b) => {
      if (!a.isSelected && !b.isSelected) {
        return 0;
      } else if (a.isSelected && (!b.isSelected || a.index < b.index)) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  sortOptionsGroup(options) {
    let sortOptions = this.sortOptions;
    options = this.structureOptionGroup(options);

    options.forEach((d) => {
      let childOptions = d.options;
      d.isSelected = childOptions.some((e) => e.isSelected);

      if (d.isSelected) {
        sortOptions(childOptions);
      }
    });

    sortOptions(options);

    return this.destructureOptionGroup(options);
  }

  isOptionVisible(d, searchValue, hasExactOption, visibleOptionGroupsMapping) {
    let value = d.label.toLowerCase();
    let description = d.description;
    let alias = d.alias;
    let isVisible = value.indexOf(searchValue) !== -1;

    if (d.isGroupTitle) {
      isVisible = visibleOptionGroupsMapping[d.index];
    }

    if (alias && !isVisible) {
      isVisible = alias.indexOf(searchValue) !== -1;
    }

    if (description && !isVisible) {
      isVisible = description.toLowerCase().indexOf(searchValue) !== -1;
    }

    d.isVisible = isVisible;

    if (!hasExactOption) {
      hasExactOption = value === searchValue;
    }

    return {
      isVisible,
      hasExactOption,
    };
  }

  structureOptionGroup(options) {
    let result = [];
    let childOptions = {};

    /** getting all group title */
    options.forEach((d) => {
      if (d.isGroupTitle) {
        let childArray = [];
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
    let selectedValues = this.selectedValues;
    let selectedValue = DomUtils.getData($ele, 'value');

    Utils.removeItemFromArray(selectedValues, selectedValue);
    this.setValueMethod(selectedValues);
  }

  destroy() {
    let $ele = this.$ele;
    $ele.virtualSelect = undefined;
    $ele.value = undefined;
    $ele.innerHTML = '';

    if (this.hasDropboxWrapper) {
      this.$dropboxWrapper.remove();
      this.mutationObserver.disconnect();
    }

    DomUtils.removeClass($ele, 'vscomp-ele');
  }

  /** static methods - start */
  static init(options) {
    let $eleArray = options.ele;

    if (!$eleArray) {
      return;
    }

    let singleEle = false;

    if (typeof $eleArray === 'string') {
      $eleArray = document.querySelector($eleArray);

      if (!$eleArray) {
        return;
      }
    }

    if ($eleArray.length === undefined) {
      $eleArray = [$eleArray];
      singleEle = true;
    }

    let instances = [];
    $eleArray.forEach(($ele) => {
      options.ele = $ele;
      instances.push(new VirtualSelect(options));
    });

    return singleEle ? instances[0] : instances;
  }

  static resetForm(e) {
    let $form = e.target.closest('form');

    if (!$form) {
      return;
    }

    $form.querySelectorAll('.vscomp-ele-wrapper').forEach(($ele) => {
      $ele.parentElement.virtualSelect.reset();
    });
  }

  static reset() {
    this.virtualSelect.reset();
  }

  static setValueMethod(value, silentChange) {
    this.virtualSelect.setValueMethod(value, silentChange);
  }

  static setOptionsMethod(options, keepValue) {
    this.virtualSelect.setOptionsMethod(options, keepValue);
  }

  static setDisabledOptionsMethod(options) {
    this.virtualSelect.setDisabledOptionsMethod(options);
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

  static getSelectedOptionsMethod() {
    return this.virtualSelect.getSelectedOptions();
  }

  static openMethod() {
    return this.virtualSelect.openDropbox();
  }

  static closeMethod() {
    return this.virtualSelect.closeDropbox();
  }

  static destroyMethod() {
    return this.virtualSelect.destroy();
  }

  static onResizeMethod() {
    document.querySelectorAll('.vscomp-ele-wrapper').forEach(($ele) => {
      $ele.parentElement.virtualSelect.onResize();
    });
  }
  /** static methods - end */
}

document.addEventListener('reset', VirtualSelect.resetForm);
window.addEventListener('resize', VirtualSelect.onResizeMethod);

window.VirtualSelect = VirtualSelect;
