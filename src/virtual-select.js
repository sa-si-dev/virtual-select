const keyDownMethodMapping = {
  13: 'onEnterPress',
  27: 'onEscPress',
  38: 'onUpArrowPress',
  40: 'onDownArrowPress',
};

const virtualSelectVersion = 'v1.0.4';

/** Class representing VirtualSelect */
export class VirtualSelect {
  /**
   * Create a VirtualSelect
   * @property {(element|string)} ele - Parent element to render VirtualSelect
   * @property {object[]} options - Array of object to show as options
   * @property {(string|number)} options[].value - Value of the option
   * @property {(string|number)} options[].label - Display text of the option
   * @property {(string|array)} options[].alias - Alternative labels to use on search. Array of string or comma separated string.
   * @property {array} options[].options - List of options for option group
   * @property {string} [valueKey=value] - Key name to get value from options object
   * @property {string} [labelKey=label] - Key name to get display text from options object
   * @property {string} [aliasKey=alias] - Key name to get alias from options object
   * @property {boolean} [multiple=false] - Enable multiselect
   * @property {boolean} [search=false] - Enable search
   * @property {boolean} [hideClearButton=false] - Hide clear button
   * @property {boolean} [disableSelectAll=false] - Disable select all feature of multiple select
   * @property {string} [optionsCount=5] - No.of options to show on viewport
   * @property {string} [optionHeight=40px] - Height of each dropdown options
   * @property {string} [position=auto] - Position of dropbox (top, bottom, auto)
   * @property {string} [placeholder=Select] - Text to show when no options selected
   * @property {string} [noOptionsText=No options found] - Text to show when no options to show
   * @property {string} [noSearchResultsText=No results found] - Text to show when no results on search
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
   * @property {string} [hiddenInputName] - Name attribute for hidden input
   * @property {boolean} [keepAlwaysOpen] - Keep dropbox always open with fixed height
   * @property {number} [maxValues=0] - Maximum no.of options allowed to choose in multiple select
   */
  constructor(options) {
    try {
      this.setProps(options);
      this.setDisabledOptions(options.disabledOptions);
      this.setOptions(options.options);
      this.render();
      this.addEvents();
      this.setMethods();

      if (options.selectedValue) {
        this.setValueMethod(options.selectedValue, this.silentInitialValueSet);
      }
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
    let clearButtonTooltip = this.getTooltipAttrText('Clear');
    let optionsHeight = this.optionsHeight;
    let noOptionStyle = {};
    let optionsStyle = {
      'max-height': optionsHeight,
    };

    let dropboxStyle = {
      'z-index': this.zIndex,
    };

    if (this.dropboxWidth) {
      dropboxStyle.width = this.dropboxWidth;
    }

    if (this.multiple) {
      wrapperClasses += ' multiple';

      if (!this.disableSelectAll) {
        wrapperClasses += ' has-select-all';
      }
    }

    if (this.position === 'top') {
      wrapperClasses += ' position-top';
    }

    if (!this.hideClearButton) {
      wrapperClasses += ' has-clear-button';
    }

    if (this.keepAlwaysOpen) {
      wrapperClasses += ' keep-always-open opened';
      optionsStyle.height = optionsHeight;
      noOptionStyle.height = optionsHeight;
    } else {
      wrapperClasses += ' closed';
    }

    let html = `<div class="${wrapperClasses}" tabindex="0">
        <input type="hidden" name="${this.hiddenInputName}" class="vscomp-hidden-input">
        <div class="vscomp-toggle-button">
          <div class="vscomp-value" ${valueTooltip}>
            ${this.placeholder}
          </div>
          <div class="vscomp-arrow"></div>
          <div class="vscomp-clear-button toggle-button-child" ${clearButtonTooltip}>
          </div>
        </div>
        <div class="vscomp-dropbox" ${this.getStyleText(dropboxStyle)}>
          <div class="vscomp-search-wrapper"></div>
          <div class="vscomp-options-container" ${this.getStyleText(optionsStyle)}>
            <div class="vscomp-options-list">
              <div class="vscomp-options"></div>
            </div>
          </div>
          <div class="vscomp-no-options" ${this.getStyleText(noOptionStyle)}>${this.noOptionsText}</div>
          <div class="vscomp-no-search-results" ${this.getStyleText(noOptionStyle)}>${this.noSearchResultsText}</div>
        </div>
      </div>`;

    this.$ele.innerHTML = html;
    this.$wrapper = this.$ele.querySelector('.vscomp-wrapper');
    this.$toggleButton = this.$ele.querySelector('.vscomp-toggle-button');
    this.$clearButton = this.$ele.querySelector('.vscomp-clear-button');
    this.$dropbox = this.$ele.querySelector('.vscomp-dropbox');
    this.$search = this.$ele.querySelector('.vscomp-search-wrapper');
    this.$optionsContainer = this.$ele.querySelector('.vscomp-options-container');
    this.$optionsList = this.$ele.querySelector('.vscomp-options-list');
    this.$options = this.$ele.querySelector('.vscomp-options');
    this.$valueText = this.$ele.querySelector('.vscomp-value');
    this.$hiddenInput = this.$ele.querySelector('.vscomp-hidden-input');

    this.addClass(this.$ele, 'vscomp-ele');
    this.renderSearch();
    this.setOptionsHeight();
    this.setVisibleOptions();
  }

  renderOptions() {
    let html = '';
    let visibleOptions = this.getVisibleOptions();
    let checkboxHtml = '';
    let newOptionIconHtml = '';
    let markSearchResults = (this.markSearchResults && this.searchValue) ? true : false;
    let searchRegex;

    let styleText = this.getStyleText({
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
      let optionLabel = d.label;
      let optionClasses = 'vscomp-option';
      let optionTooltip = this.getTooltipAttrText('', true);
      let leftSection = checkboxHtml;
      let rightSection = '';

      if (d.isSelected) {
        optionClasses += ' selected';
      }

      if (d.isFocused) {
        optionClasses += ' focused';
      }

      if (d.isDisabled) {
        optionClasses += ' disabled';
      }

      if (d.isGroupTitle) {
        optionClasses += ' group-title';
        leftSection = '';
      }

      if (d.isGroupOption) {
        optionClasses += ' group-option';
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
          ${rightSection}
        </div>`;
    });

    this.$options.innerHTML = html;
    let hasNoOptions = !this.options.length;
    let hasNoSearchResults = !hasNoOptions && !visibleOptions.length;

    if (!this.allowNewOption) {
      this.toggleClass(this.$wrapper, 'has-no-search-results', hasNoSearchResults);
    }

    this.toggleClass(this.$wrapper, 'has-no-options', hasNoOptions);
    this.setOptionsPosition();
    this.setOptionsTooltip();
    this.moveFocusedOptionToView();
  }

  renderSearch() {
    if (!this.hasSearch) {
      return;
    }

    let checkboxHtml = '';

    if (this.multiple && !this.disableSelectAll) {
      checkboxHtml = '<span class="checkbox-icon toggle-all-options"></span>';
    }

    let html = `<div class="vscomp-search-container">
        ${checkboxHtml}
        <input type="text" class="vscomp-search-input" placeholder="Search...">
        <span class="vscomp-search-clear">&times;</span>
      </div>`;

    this.$search.innerHTML = html;
    this.$searchInput = this.$ele.querySelector('.vscomp-search-input');
    this.$searchClear = this.$ele.querySelector('.vscomp-search-clear');
    this.$toggleAllOptions = this.$ele.querySelector('.toggle-all-options');

    this.addEvent(this.$searchInput, 'keyup change', 'onSearch');
    this.addEvent(this.$searchClear, 'click', 'onSearchClear');
    this.addEvent(this.$toggleAllOptions, 'click', 'onToggleAllOptions');
  }
  /** render methods - end */

  /** event methods - start */
  addEvents() {
    this.addEvent(document, 'click', 'onDocumentClick');
    this.addEvent(this.$wrapper, 'keydown', 'onKeyDown');
    this.addEvent(this.$toggleButton, 'click', 'onToggleButtonClick');
    this.addEvent(this.$clearButton, 'click', 'onClearButtonClick');
    this.addEvent(this.$optionsContainer, 'scroll', 'onOptionsScroll');
    this.addEvent(this.$options, 'click', 'onOptionsClick');
    this.addEvent(this.$options, 'mouseover', 'onOptionsMouseOver');
    this.addEvent(this.$options, 'touchmove', 'onOptionsTouchMove');
  }

  addEvent($ele, events, method) {
    if (!$ele) {
      return;
    }

    events = this.removeArrayEmpty(events.split(' '));

    events.forEach((event) => {
      let eventsKey = `${method}-${event}`;
      let callback = this.events[eventsKey];

      if (!callback) {
        callback = this[method].bind(this);
        this.events[eventsKey] = callback;
      }

      $ele = this.getElements($ele);

      $ele.forEach((_this) => {
        _this.addEventListener(event, callback);
      });
    });
  }

  dispatchEvent($ele, eventName) {
    if (!$ele) {
      return;
    }

    $ele = this.getElements($ele);

    setTimeout(() => {
      $ele.forEach((_this) => {
        _this.dispatchEvent(new Event(eventName, { bubbles: true }));
      });
    }, 0);
  }

  onDocumentClick(e) {
    VirtualSelect.closeAllDropbox(e.target.closest('.vscomp-wrapper'));
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

  onEscPress() {
    if (this.isOpened()) {
      this.closeDropbox();
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
    let childEle = e.target.closest('.toggle-button-child');

    if (childEle) {
      return;
    }

    this.toggleDropbox();
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

  onOptionsMouseOver(e) {
    let $ele = e.target.closest('.vscomp-option:not(.disabled):not(.group-title)');

    if ($ele) {
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
  /** event methods - end */

  /** set methods - start */
  setProps(options) {
    options = this.setDefaultProps(options);
    this.setPropsFromElementAttr(options);

    this.$ele = options.ele;
    this.valueKey = options.valueKey;
    this.labelKey = options.labelKey;
    this.aliasKey = options.aliasKey;
    this.optionsCount = parseInt(options.optionsCount);
    this.halfOptionsCount = Math.ceil(this.optionsCount / 2);
    this.optionHeightText = options.optionHeight;
    this.optionHeight = parseFloat(this.optionHeightText);
    this.multiple = this.convertToBoolean(options.multiple);
    this.hasSearch = this.convertToBoolean(options.search);
    this.hideClearButton = this.convertToBoolean(options.hideClearButton);
    this.silentInitialValueSet = this.convertToBoolean(options.silentInitialValueSet);
    this.allowNewOption = this.convertToBoolean(options.allowNewOption);
    this.markSearchResults = this.convertToBoolean(options.markSearchResults);
    this.showSelectedOptionsFirst = this.convertToBoolean(options.showSelectedOptionsFirst);
    this.disableSelectAll = this.convertToBoolean(options.disableSelectAll);
    this.keepAlwaysOpen = this.convertToBoolean(options.keepAlwaysOpen);
    this.noOptionsText = options.noOptionsText;
    this.noSearchResultsText = options.noSearchResultsText;
    this.placeholder = options.placeholder;
    this.position = options.position;
    this.dropboxWidth = options.dropboxWidth;
    this.tooltipFontSize = options.tooltipFontSize;
    this.tooltipAlignment = options.tooltipAlignment;
    this.tooltipMaxWidth = options.tooltipMaxWidth;
    this.noOfDisplayValues = parseInt(options.noOfDisplayValues);
    this.zIndex = parseInt(options.zIndex);
    this.maxValues = parseInt(options.maxValues);
    this.hiddenInputName = options.hiddenInputName;
    this.selectedValues = [];
    this.newValues = [];
    this.events = {};
    this.tooltipEnterDelay = 200;
    this.transitionDuration = 250;
    this.searchValue = '';
    this.searchValueOriginal = '';
    this.isAllSelected = false;
    this.optionsHeight = this.optionsCount * this.optionHeight + 'px';

    if ((options.search === undefined && this.multiple) || this.allowNewOption) {
      this.hasSearch = true;
    }

    if (this.maxValues) {
      this.disableSelectAll = true;
    }
  }

  setDefaultProps(options) {
    let defaultOptions = {
      valueKey: 'value',
      labelKey: 'label',
      aliasKey: 'alias',
      optionsCount: 5,
      noOfDisplayValues: 50,
      optionHeight: '40px',
      multiple: false,
      hideClearButton: false,
      silentInitialValueSet: false,
      disableSelectAll: false,
      noOptionsText: 'No options found',
      noSearchResultsText: 'No results found',
      placeholder: 'Select',
      position: 'auto',
      zIndex: 1,
      allowNewOption: false,
      markSearchResults: false,
      tooltipFontSize: '14px',
      tooltipAlignment: 'center',
      tooltipMaxWidth: '300px',
      showSelectedOptionsFirst: false,
      hiddenInputName: '',
      keepAlwaysOpen: false,
      maxValues: 0,
    };

    return Object.assign(defaultOptions, options);
  }

  setPropsFromElementAttr(options) {
    let $ele = options.ele;
    let mapping = {
      multiple: 'multiple',
      placeholder: 'placeholder',
      'data-label-key': 'labelKey',
      'data-value-key': 'valueKey',
      'data-alias-key': 'aliasKey',
      'data-search': 'search',
      'data-hide-clear-button': 'hideClearButton',
      'data-options-count': 'optionsCount',
      'data-option-height': 'optionHeight',
      'data-position': 'position',
      'data-no-options-text': 'noOptionsText',
      'data-no-search-results-text': 'noSearchResultsText',
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
      'data-hidden-input-name': 'hiddenInputName',
      'data-disable-select-all': 'disableSelectAll',
      'data-keep-always-open': 'keepAlwaysOpen',
      'data-max-values': 'maxValues',
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
  }

  setValueMethod(value, silentChange) {
    if (!Array.isArray(value)) {
      value = [value];
    }

    value = value.map((v) => {
      return v || v == 0 ? v.toString() : '';
    });

    let validValues = [];

    this.options.forEach((d) => {
      let isSelected = value.indexOf(d.value) !== -1;

      if (isSelected && !d.isDisabled && !d.isGroupTitle) {
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

  setOptionsMethod(options) {
    this.setOptions(options);
    this.afterSetOptions();
  }

  setDisabledOptionsMethod(disabledOptions) {
    this.setDisabledOptions(disabledOptions, true);
    this.setValueMethod(null);
    this.setVisibleOptions();
  }

  setDisabledOptions(disabledOptions = [], setOptionsProp = false) {
    disabledOptions = disabledOptions.map((d) => d.toString());
    this.disabledOptions = disabledOptions;

    if (setOptionsProp && disabledOptions.length) {
      this.options.forEach((d) => {
        d.isDisabled = disabledOptions.indexOf(d.value) !== -1;

        return d;
      });
    }
  }

  setOptions(options) {
    if (!options) {
      options = [];
    }

    let preparedOptions = [];
    let disabledOptions = this.disabledOptions;
    let hasDisabledOptions = disabledOptions.length;
    let valueKey = this.valueKey;
    let labelKey = this.labelKey;
    let aliasKey = this.aliasKey;
    let index = 0;
    let hasOptionGroup = false;

    let prepareOption = (d) => {
      let value = (d[valueKey] || '').toString();
      let childOptions = d.options;
      let isGroupTitle = childOptions ? true : false;
      let option = {
        index,
        value,
        label: d[labelKey] || '',
        alias: this.getAlias(d[aliasKey]),
        isVisible: true,
        isGroupTitle,
      };
      
      if (hasDisabledOptions) {
        option.isDisabled = disabledOptions.indexOf(value) !== -1;
      }

      if (d.isGroupOption) {
        option.isGroupOption = true;
      }

      preparedOptions.push(option);
      index++;

      if (isGroupTitle) {
        hasOptionGroup = true;

        childOptions.forEach((d) => {
          d.isGroupOption = true;

          prepareOption(d);
        });
      }
    };

    options.forEach(prepareOption);

    if (hasOptionGroup) {
      this.showSelectedOptionsFirst = false;
    }

    this.options = preparedOptions;
    this.visibleOptionsCount = preparedOptions.length;
    this.lastOptionIndex = this.options.length - 1;
    this.newValues = [];
    this.hasOptionGroup = hasOptionGroup;
    this.setSortedOptions();
  }

  setSortedOptions() {
    let sortedOptions = [...this.options];

    if (this.showSelectedOptionsFirst && this.selectedValues.length) {
      sortedOptions = sortedOptions.sort((a, b) => {
        if (!a.isSelected && !b.isSelected) {
          return 0;
        } else if (a.isSelected && (!b.isSelected || a.index < b.index)) {
          return -1;
        } else {
          return 1;
        }
      });
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
    this.setData(this.$options, 'top', top);
  }

  setOptionsTooltip() {
    let visibleOptions = this.getVisibleOptions();

    visibleOptions.forEach((d) => {
      let $optionEle = this.$dropbox.querySelector(`.vscomp-option[data-index="${d.index}"] .vscomp-option-text`);

      this.setData($optionEle, 'tooltip', d.label);
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

    let newValue = this.multiple ? this.selectedValues : (this.selectedValues[0] || '');
    this.$ele.value = newValue;
    this.$hiddenInput.value = newValue;
    this.isMaxValuesSelected = (this.maxValues && this.maxValues <= this.selectedValues.length) ? true : false;
    this.setValueText();
    this.toggleClass(this.$wrapper, 'has-value', this.isNotEmpty(this.selectedValues));
    this.toggleClass(this.$wrapper, 'max-value-selected', this.isMaxValuesSelected);

    if (triggerEvent) {
      this.dispatchEvent(this.$ele, 'change');
    }
  }

  setValueText() {
    let valueText = [];
    let valueTooltip = [];
    let selectedValues = this.selectedValues;
    let selectedLength = selectedValues.length;
    let noOfDisplayValues = this.noOfDisplayValues;
    let maximumValuesToShow = 50;
    let selectedValuesCount = 0;

    if (this.isAllSelected) {
      this.$valueText.innerHTML = `All (${selectedLength})`;
    } else {
      for (let d of this.options) {
        if (d.isCurrentNew) {
          continue;
        }
  
        if (selectedValuesCount > maximumValuesToShow) {
          break;
        }
  
        let value = d.value;
  
        if (selectedValues.indexOf(value) !== -1) {
          let label = d.label;
          valueText.push(label);
          selectedValuesCount++;
  
          if (selectedValuesCount <= noOfDisplayValues) {
            valueTooltip.push(`<span class="vscomp-value-tag">${label}</span>`);
          }
        }
      }
  
      let moreSelectedOptions = selectedLength - noOfDisplayValues;
  
      if (moreSelectedOptions > 0) {
        valueTooltip.push(`<span class="vscomp-value-tag more-value-count">+ ${moreSelectedOptions} more...</span>`);
      }

      const aggregatedValueText = valueText.join(', ');

      if (aggregatedValueText === '') {
        this.$valueText.innerHTML = this.placeholder;
      } else {
        this.$valueText.innerHTML = aggregatedValueText;

        if (this.multiple) {
          let maxValues = this.maxValues;

          if (this.hasEllipsis(this.$valueText) || maxValues) {
            let countText = `${selectedLength}`;

            if (maxValues) {
              countText += ` / ${maxValues}`;
            }

            /** replace comma delimitted list of selections with shorter text indicating selection count */
            this.$valueText.innerHTML = `${countText} option${selectedLength === 1 ? '' : 's'} selected`;
          } else {
            /** removing tooltip if full value text is visible */
            valueTooltip = [];
          }
        }
      }
    }

    this.setData(this.$valueText, 'tooltip', valueTooltip.join(', '));
  }

  setSearchValue(value, skipInputSet) {
    if (value === this.searchValueOriginal) {
      return;
    }

    if (!skipInputSet) {
      this.$searchInput.value = value;
    }

    let searchValue = value.toLowerCase().trim();
    let visibleOptionsCount = 0;
    let hasExactOption = false;
    this.searchValue = searchValue;
    this.searchValueOriginal = value;

    this.options.forEach((d) => {
      if (d.isCurrentNew) {
        return;
      }

      let value = d.label.toString().toLowerCase();
      let alias = d.alias;
      let isVisible = value.indexOf(searchValue) !== -1;

      if (d.isGroupTitle) {
        isVisible = true;
      }
      
      if (alias && !isVisible) {
        isVisible = alias.indexOf(searchValue) !== -1;
      }

      d.isVisible = isVisible;

      if (isVisible) {
        visibleOptionsCount++;
      }

      if (!hasExactOption) {
        hasExactOption = value === searchValue;
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

    this.toggleClass(this.$wrapper, 'has-search-value', value);
    this.scrollToTop();
    this.setOptionsHeight();
    this.setVisibleOptions();
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

  setDropboxPosition() {
    if (this.position !== 'auto') {
      return;
    }

    let moreVisibleSides = this.getMoreVisibleSides(this.$wrapper);
    let showOnLeft = false;

    /** check that is dropbox hidden on right edge - only if custom width given */
    if (this.dropboxWidth) {
      let buttonCoords = this.$toggleButton.getBoundingClientRect();
      let viewportWidth = window.innerWidth;
      let dropboxWidth = parseFloat(this.dropboxWidth);
      let hiddenOnRight = buttonCoords.left + dropboxWidth > viewportWidth;
      let hiddenOnLeft = dropboxWidth > buttonCoords.right;
      
      if (hiddenOnRight && !hiddenOnLeft) {
        showOnLeft = true;
      }
    }

    this.toggleClass(this.$wrapper, 'position-top', moreVisibleSides.vertical === 'top');
    this.toggleClass(this.$wrapper, 'position-left', showOnLeft);
  }

  setNewOption() {
    let value = this.searchValueOriginal.trim();

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
        isCurrentNew: true,
      };
  
      this.addOption(data);
    }
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

    return this.getAttributesText(data);
  }

  getOptionObj(data) {
    if (!data) {
      return;
    }

    let newOption = {
      index: data.index,
      value: data.value ? data.value.toString() : '',
      label: data.label || '',
      alias: this.getAlias(data.alias),
      isCurrentNew: data.isCurrentNew || false,
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
    let newValues = this.newValues;
    let result = this.selectedValues.filter((d) => newValues.indexOf(d) !== -1);

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
    let selectedValues = this.selectedValues;

    for (let d of this.options) {
      if (selectedValues.indexOf(d.value) !== -1) {
        displayValues.push(d.label);
      }
    }

    return this.multiple ? displayValues : (displayValues[0] || '');
  }
  /** get methods - end */

  openDropbox(isSilent) {
    this.setDropboxPosition();
    this.removeClass(this.$wrapper, 'closed');

    setTimeout(() => {
      this.addClass(this.$wrapper, 'opened');

      if (!isSilent) {
        this.moveSelectedOptionsFirst();
        this.addClass(this.$wrapper, 'focused');
        this.focusSearchInput();
      }
    }, 0);
  }

  closeDropbox(isSilent) {
    if (this.keepAlwaysOpen) {
      this.removeOptionFocus();
      return;
    }

    let transitionDuration = isSilent ? 0 : this.transitionDuration;

    setTimeout(() => {
      this.removeClass(this.$wrapper, 'opened focused');
      this.removeOptionFocus();
    }, 0);

    setTimeout(() => {
      this.addClass(this.$wrapper, 'closed');
    }, transitionDuration);
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
    return this.hasClass(this.$wrapper, 'opened');
  }

  focusSearchInput() {
    let $ele = this.$searchInput;

    if ($ele) {
      $ele.focus();
    }
  }

  focusOption(direction, ele) {
    let $focusedEle = this.$dropbox.querySelector('.vscomp-option.focused');
    let $newFocusedEle;

    if (ele) {
      $newFocusedEle = ele;
    } else if (!$focusedEle) {
      /* if no element on focus choose first visible one */
      let firstVisibleOptionIndex = this.getFirstVisibleOptionIndex();
      $newFocusedEle = this.$dropbox.querySelector(`.vscomp-option[data-visible-index="${firstVisibleOptionIndex}"]`);

      if (this.hasClass($newFocusedEle, 'disabled') || this.hasClass($newFocusedEle, 'group-title')) {
        $newFocusedEle = this.getSibling($newFocusedEle, 'next');
      }
    } else {
      $newFocusedEle = this.getSibling($focusedEle, direction);
    }

    if ($newFocusedEle && $newFocusedEle !== $focusedEle) {
      if ($focusedEle) {
        this.removeClass($focusedEle, 'focused');
      }

      this.addClass($newFocusedEle, 'focused');
      this.toggleFocusedProp(this.getData($newFocusedEle, 'index'), true);
      this.moveFocusedOptionToView($newFocusedEle);
    }
  }

  moveFocusedOptionToView($focusedEle) {
    if (!$focusedEle) {
      $focusedEle = this.$dropbox.querySelector('.vscomp-option.focused');
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
    let optionsTop = this.getData(this.$options, 'top', 'number');

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
    let $focusedEle = this.$dropbox.querySelector('.vscomp-option.focused');

    if (!$focusedEle) {
      return;
    }

    this.removeClass($focusedEle, 'focused');
    this.toggleFocusedProp(null);
  }

  selectOption($ele) {
    if (!$ele) {
      return;
    }

    let isAdding = !this.hasClass($ele, 'selected');

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
    let selectedValue = this.getData($ele, 'value');
    let selectedIndex = this.getData($ele, 'index');

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
        let $prevSelectedOption = this.$ele.querySelector('.vscomp-option.selected');

        if ($prevSelectedOption) {
          this.toggleClass($prevSelectedOption, 'selected', false);
        }

        this.closeDropbox();
      }

      this.toggleClass($ele, 'selected');
    } else {
      if (this.multiple) {
        this.toggleClass($ele, 'selected');
        this.removeItemFromArray(selectedValues, selectedValue);
        this.toggleAllOptionsClass(false);
      }
    }

    if (this.hasClass($ele, 'current-new')) {
      this.beforeSelectNewValue();
    }

    this.setValue(selectedValues, true);
  }

  selectFocusedOption() {
    this.selectOption(this.$dropbox.querySelector('.vscomp-option.focused'));
  }

  toggleAllOptions(isSelected) {
    if (!this.multiple || this.disableSelectAll) {
      return;
    }

    if (typeof isSelected !== 'boolean') {
      isSelected = !this.hasClass(this.$toggleAllOptions, 'checked');
    }

    let selectedValues = [];

    this.options.forEach((d) => {
      if (d.isDisabled || d.isCurrentNew || d.isGroupTitle) {
        return;
      }

      d.isSelected = isSelected;

      if (isSelected) {
        selectedValues.push(d.value);
      }
    });

    this.toggleAllOptionsClass(isSelected);
    this.setValue(selectedValues, true);
    this.renderOptions();
  }

  toggleAllOptionsClass(isAllSelected) {
    if (typeof isAllSelected !== 'boolean') {
      isAllSelected = false;

      if (this.options.length) {
        isAllSelected = !this.options.some((d) => {
          return !d.isSelected && !d.isDisabled && !d.isGroupTitle;
        });
      }
    }

    this.toggleClass(this.$toggleAllOptions, 'checked', isAllSelected);
    this.isAllSelected = isAllSelected;
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
  }

  beforeValueSet(isReset) {
    this.toggleAllOptionsClass(isReset ? false : undefined);
  }

  afterValueSet() {
    this.scrollToTop();
    this.setSearchValue('');
    this.renderOptions();
  }

  afterSetOptions() {
    this.setOptionsHeight();
    this.setVisibleOptions();
    this.reset();
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

  /** helper methods - start */
  addClass($ele, className) {
    if (!$ele) {
      return;
    }

    className = className.split(' ');

    this.getElements($ele).forEach((_this) => {
      _this.classList.add(...className);
    });
  }

  removeClass($ele, className) {
    if (!$ele) {
      return;
    }

    className = className.split(' ');

    this.getElements($ele).forEach((_this) => {
      _this.classList.remove(...className);
    });
  }

  toggleClass($ele, className, isAdd) {
    if (!$ele) {
      return;
    }

    if (isAdd !== undefined) {
      isAdd = Boolean(isAdd);
    }

    let isAdded;

    this.getElements($ele).forEach((_this) => {
      isAdded = _this.classList.toggle(className, isAdd);
    });

    return isAdded;
  }

  hasClass($ele, className) {
    if (!$ele) {
      return false;
    }

    return $ele.classList.contains(className);
  }

  isEmpty(value) {
    let result = false;

    if (!value) {
      result = true;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        result = true;
      }
    } else if (typeof value === 'object') {
      if (Object.keys(value).length === 0) {
        result = true;
      }
    }

    return result;
  }

  isNotEmpty(value) {
    return !this.isEmpty(value);
  }

  setData($ele, name, value) {
    if (!$ele) {
      return;
    }

    $ele.dataset[name] = value;
  }

  getStyleText(props, skipAttrName) {
    let result = '';

    for (let k in props) {
      result += `${k}: ${props[k]};`;
    }

    if (result && !skipAttrName) {
      result = `style="${result}"`;
    }

    return result;
  }

  getElements($ele) {
    if (!$ele) {
      return;
    }

    if ($ele.length === undefined) {
      $ele = [$ele];
    }

    return $ele;
  }

  getData($ele, name, type) {
    if (!$ele) {
      return;
    }

    let value = $ele ? $ele.dataset[name] : '';

    if (type === 'number') {
      value = parseFloat(value) || 0;
    } else {
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
    }

    return value;
  }

  removeItemFromArray(array, value, cloneArray) {
    if (!Array.isArray(array) || !array.length || !value) {
      return array;
    }

    if (cloneArray) {
      array = [...array];
    }

    let index = array.indexOf(value);

    if (index !== -1) {
      array.splice(index, 1);
    }

    return array;
  }

  removeArrayEmpty(array) {
    if (!Array.isArray(array) || !array.length) {
      return [];
    }

    return array.filter((d) => !!d);
  }

  getMoreVisibleSides($ele) {
    if (!$ele) {
      return {};
    }

    let box = $ele.getBoundingClientRect();
    let availableWidth = window.innerWidth;
    let availableHeight = window.innerHeight;
    let leftArea = box.left;
    let topArea = box.top;
    let rightArea = availableWidth - leftArea - box.width;
    let bottomArea = availableHeight - topArea - box.height;
    let horizontal = leftArea > rightArea ? 'left' : 'right';
    let vertical = topArea > bottomArea ? 'top' : 'bottom';

    return {
      horizontal,
      vertical,
    };
  }

  getSibling($ele, direction) {
    let propName = direction === 'next' ? 'nextElementSibling' : 'previousElementSibling';

    do {
      if ($ele) {
        $ele = $ele[propName];
      }
    } while (this.hasClass($ele, 'disabled') || this.hasClass($ele, 'group-title'));

    return $ele;
  }

  getAttributesText(data) {
    let html = '';
  
    if (!data) {
      return html;
    }
  
    for (let k in data) {
      let value = data[k];

      if (value !== undefined) {
        html +=  ` ${k}="${value}" `;
      }
    }
  
    return html;
  }

  convertToBoolean(value) {
    return (value === true || value === 'true') ? true : false;
  }

  hasEllipsis($ele) {
    if (!$ele) {
      return false;
    }

    return $ele.scrollWidth > $ele.offsetWidth;
  }
  /** helper methods - end */

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

  static closeAllDropbox($eleToKeepOpen) {
    document.querySelectorAll('.vscomp-wrapper').forEach(($ele) => {
      if ($eleToKeepOpen && $eleToKeepOpen === $ele) {
        return;
      }

      $ele.parentElement.virtualSelect.closeDropbox();
    });
  }

  static resetForm(e) {
    let $form = e.target.closest('form');

    if (!$form) {
      return;
    }

    $form.querySelectorAll('.vscomp-wrapper').forEach(($ele) => {
      $ele.parentElement.virtualSelect.reset();
    });
  }

  static reset() {
    this.virtualSelect.reset();
  }

  static setValueMethod(value, silentChange) {
    this.virtualSelect.setValueMethod(value, silentChange);
  }

  static setOptionsMethod(options) {
    this.virtualSelect.setOptionsMethod(options);
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

  static version() {
    return virtualSelectVersion;
  }

  static getDisplayValueMethod() {
    return this.virtualSelect.getDisplayValue();
  }
  /** static methods - start */
}

document.addEventListener('reset', VirtualSelect.resetForm);

window.VirtualSelect = VirtualSelect;
