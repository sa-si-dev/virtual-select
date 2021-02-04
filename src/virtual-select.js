const keyDownMethodMapping = {
  13: 'onEnterPress',
  27: 'onEscPress',
  38: 'onUpArrowPress',
  40: 'onDownArrowPress',
};

/** Class representing VirtualSelect */
export class VirtualSelect {
  /**
   * Create a VirtualSelect
   * @property {(element|string)} ele - Parent element to render VirtualSelect
   * @property {object[]} options - Array of object to show as options
   * @property {(string|number)} options[].value - Value of the option
   * @property {(string|number)} options[].label - Display text of the option
   * @property {string} [labelKey=label] - Key name to get display text from options object
   * @property {string} [valueKey=value] - Key name to get value from options object
   * @property {string} [termsKey=terms] - Key name to get array of string terms from options object
   * @property {boolean} [multiple=false] - Enable multiselect
   * @property {boolean} [search=false] - Enable search
   * @property {boolean} [hideClearButton=false] - Hide clear button
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

    let wrapperClasses = 'vscomp-wrapper closed';
    let valueTooltip = this.getTooltipAttrText('', true);
    let clearButtonTooltip = this.getTooltipAttrText('Clear');
    let optionsStyleText = this.getStyleText({
      'max-height': this.optionsHeight,
    });

    let dropboxStyle = {
      'z-index': this.zIndex,
    };

    if (this.dropboxWidth) {
      dropboxStyle.width = this.dropboxWidth;
    }

    if (this.multiple) {
      wrapperClasses += ' multiple';
    }

    if (this.position === 'top') {
      wrapperClasses += ' position-top';
    }

    if (!this.hideClearButton) {
      wrapperClasses += ' has-clear-button';
    }

    let html = `<div class="${wrapperClasses}" tabindex="0">
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
          <div class="vscomp-options-container" ${optionsStyleText}>
            <div class="vscomp-options-list">
              <div class="vscomp-options"></div>
            </div>
          </div>
          <div class="vscomp-no-options">${this.noOptionsText}</div>
          <div class="vscomp-no-search-results">${this.noSearchResultsText}</div>
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
    let styleText = this.getStyleText({
      height: this.optionHeight + 'px',
    });

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

      if (d.isCurrentNew) {
        optionClasses += ' current-new';
        rightSection += newOptionIconHtml;
      }

      html += `<div class="${optionClasses}" data-value="${d.value}" data-index="${d.index}" data-visible-index="${d.visibleIndex}" ${styleText}>
          ${checkboxHtml}
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

    if (this.multiple) {
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
    this.selectOption(e.target.closest('.vscomp-option:not(.disabled)'));
  }

  onOptionsMouseOver(e) {
    let $ele = e.target.closest('.vscomp-option:not(.disabled)');

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
    this.labelKey = options.labelKey;
    this.valueKey = options.valueKey;
    this.termsKey = options.termsKey;
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
    this.noOptionsText = options.noOptionsText;
    this.noSearchResultsText = options.noSearchResultsText;
    this.placeholder = options.placeholder;
    this.position = options.position;
    this.dropboxWidth = options.dropboxWidth;
    this.noOfDisplayValues = parseInt(options.noOfDisplayValues);
    this.zIndex = parseInt(options.zIndex);
    this.selectedValues = [];
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
  }

  setDefaultProps(options) {
    let defaultOptions = {
      labelKey: 'label',
      valueKey: 'value',
      termsKey: 'terms',
      optionsCount: 5,
      noOfDisplayValues: 50,
      optionHeight: '40px',
      multiple: false,
      hideClearButton: false,
      silentInitialValueSet: false,
      noOptionsText: 'No options found',
      noSearchResultsText: 'No results found',
      placeholder: 'Select',
      position: 'auto',
      zIndex: 1,
      allowNewOption: false,
      markSearchResults: false,
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
      'data-terms-key': 'termsKey',
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

      if (isSelected && !d.isDisabled) {
        d.isSelected = true;
        validValues.push(d.value);
      } else {
        d.isSelected = false;
      }
    });

    if (!this.multiple) {
      validValues = validValues[0];
    }

    this.setValue(validValues, !silentChange);
    this.afterValueSet();
  }

  setOptionsMethod(options) {
    this.setOptions(options);
    this.setOptionsHeight();
    this.setVisibleOptions();
    this.reset();
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

    let disabledOptions = this.disabledOptions;
    let hasDisabledOptions = disabledOptions.length;
    let labelKey = this.labelKey;
    let valueKey = this.valueKey;
    let termsKey = this.termsKey;
    this.visibleOptionsCount = options.length;

    this.options = options.map((d, i) => {
      let value = (d[valueKey] || '').toString();
      let option = {
        index: i,
        value,
        label: d[labelKey] || '',
        isVisible: true,
        terms: Array.isArray(d[termsKey]) ? d[termsKey] : [],
      };
      
      if (hasDisabledOptions) {
        option.isDisabled = disabledOptions.indexOf(value) !== -1;
      }

      return option;
    });

    this.lastOptionIndex = this.options.length - 1;
  }

  setVisibleOptions() {
    let visibleOptions = [...this.options];
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

    this.$ele.value = this.multiple ? this.selectedValues : this.selectedValues[0] || '';
    this.setValueText();
    this.toggleClass(this.$wrapper, 'has-value', this.isNotEmpty(this.selectedValues));

    if (triggerEvent) {
      this.dispatchEvent(this.$ele, 'change');
    }
  }

  setValueText() {
    let valueText = [];
    let valueTooltip = [];
    let selectedValue = this.selectedValues;
    let noOfDisplayValues = this.noOfDisplayValues;
    let maximumValuesToShow = 50;
    let selectedValuesCount = 0;

    for (let d of this.options) {
      if (d.isCurrentNew) {
        continue;
      }

      if (selectedValuesCount > maximumValuesToShow) {
        break;
      }

      let value = d.value;

      if (selectedValue.indexOf(value) !== -1) {
        let label = d.label;
        valueText.push(label);
        selectedValuesCount++;

        if (selectedValuesCount <= noOfDisplayValues) {
          valueTooltip.push(`<span class="vscomp-value-tag">${label}</span>`);
        }
      }
    }

    let moreSelectedOptions = selectedValue.length - noOfDisplayValues;

    if (moreSelectedOptions > 0) {
      valueTooltip.push(`<span class="vscomp-value-tag">+ ${moreSelectedOptions} more...</span>`);
    }

    this.$valueText.innerHTML = valueText.join(', ') || this.placeholder;
    this.setData(this.$valueText, 'tooltip', valueTooltip.join(', '));
  }

  setSearchValue(value, skipInputSet) {
    if (value === this.searchValueOriginal) {
      return;
    }

    if (!skipInputSet) {
      this.$searchInput.value = value;
    }

    const markSearchResults = this.markSearchResults;
    let searchValue = value.toLowerCase().trim();
    let visibleOptionsCount = 0;
    let hasExactOption = false;
    this.searchValue = searchValue;
    this.searchValueOriginal = value;

    this.options.forEach((d) => {
      if (d.isCurrentNew) {
        return;
      }

      if (markSearchResults) {
        /** remove previous modifications to the label */
        d.label = d.label.replace(/<\/?mark.*?>/g, '');
      }

      const value = d.label.toString().toLowerCase();
      const matchedLabel = value.indexOf(searchValue) !== -1;
      const matchedTerms = matchedLabel ? false : d.terms.some(x => x.indexOf(searchValue) !== -1);
      let isVisible = matchedLabel || matchedTerms;
      d.isVisible = isVisible;

      if (isVisible) {
        visibleOptionsCount++;
        if (markSearchResults) {
          if (matchedLabel) {
            d.label = d.label.replace(new RegExp(`(${searchValue})`, 'gi'), `<mark>$1</mark>`);
          } else if (matchedTerms) {
            /** if we didn't match the label but matched any of the terms mark the entire label */
            d.label = `<mark class="vscomp-termsmatch">${d.label}</mark>`;
          }
        }
      }

      if (!hasExactOption) {
        hasExactOption = value === searchValue;
      }
    });

    this.visibleOptionsCount = visibleOptionsCount;

    if (this.allowNewOption) {
      if (value && !hasExactOption) {
        this.setNewOption();
        this.visibleOptionsCount++;
      } else {
        this.removeNewOption();
      }
    }

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
  
      this.addOption(this.getOptionObj(data));
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

  getTooltipAttrText(text, ellipsisOnly) {
    let data = {
      'data-tooltip': text || '',
      'data-tooltip-enter-delay': this.tooltipEnterDelay,
      'data-tooltip-z-index': this.zIndex,
      'data-tooltip-ellipsis-only': ellipsisOnly || false,
    };

    return this.getAttributesText(data);
  }

  getOptionObj(data) {
    if (!data) {
      return;
    }

    let newOption = {
      index: data.index,
      isCurrentNew: data.isCurrentNew || false,
      value: data.value,
      label: data.label,
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
  /** get methods - end */

  openDropbox(isSilent) {
    this.setDropboxPosition();
    this.removeClass(this.$wrapper, 'closed');

    setTimeout(() => {
      this.addClass(this.$wrapper, 'opened');

      if (!isSilent) {
        this.addClass(this.$wrapper, 'focused');
        this.focusSearchInput();
      }
    }, 0);
  }

  closeDropbox(isSilent) {
    let transitionDuration = isSilent ? 0 : this.transitionDuration;

    setTimeout(() => {
      this.removeClass(this.$wrapper, 'opened focused');
      this.removeOptionFocus();
    }, 0);

    setTimeout(() => {
      this.addClass(this.$wrapper, 'closed');
    }, transitionDuration);
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

      if (this.hasClass($newFocusedEle, 'disabled')) {
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

    /** on selecting same value in single select */
    if (!isAdding && !this.multiple) {
      this.closeDropbox();
      return;
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
    if (!this.multiple) {
      return;
    }

    if (typeof isSelected !== 'boolean') {
      isSelected = !this.hasClass(this.$toggleAllOptions, 'checked');
    }

    let selectedValues = [];

    this.options.forEach((d) => {
      if (d.isDisabled || d.isCurrentNew) {
        return;
      }

      d.isSelected = isSelected;

      if (isSelected) {
        selectedValues.push(d.value);
      }
    });

    this.setValue(selectedValues, true);
    this.toggleAllOptionsClass(isSelected);
    this.renderOptions();
  }

  toggleAllOptionsClass(isAllSelected) {
    if (typeof isAllSelected !== 'boolean') {
      isAllSelected = false;

      if (this.options.length) {
        isAllSelected = !this.options.some((d) => {
          return !d.isSelected && !d.isDisabled;
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

    this.setValue(null, true);
    this.afterValueSet(true);
  }

  afterValueSet(isReset) {
    this.scrollToTop();
    this.toggleAllOptionsClass(isReset ? false : undefined);
    this.setSearchValue('');
    this.renderOptions();
  }

  addOption(data) {
    if (!data) {
      return;
    }

    this.lastOptionIndex++;
    data.index = this.lastOptionIndex;

    this.options.push(this.getOptionObj(data));
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
    } while (this.hasClass($ele, 'disabled'));

    return $ele;
  }

  getAttributesText(data) {
    let html = '';
  
    if (!data) {
      return html;
    }
  
    for (let k in data) {
      html +=  ` ${k}="${data[k]}" `;
    }
  
    return html;
  }

  convertToBoolean(value) {
    return (value === true || value === 'true') ? true : false;
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
  /** static methods - start */
}

document.addEventListener('reset', VirtualSelect.resetForm);

window.VirtualSelect = VirtualSelect;
