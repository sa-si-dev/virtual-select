import * as tooltip from './tooltip';

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
   * @property {string} [valueKey=value] - Key name to get value from options object
   * @property {string} [labelKey=label] - Key name to get display text from options object
   * @property {boolean} [multiple=false] - Enable multiselect
   * @property {boolean} [search=false] - Enable search
   * @property {boolean} [hideClearButton=false] - Hide clear button
   * @property {string} [optionsCount=5] - No.of options to show on viewport
   * @property {string} [optionHeight=40px] - Height of each dropdown options
   * @property {string} [position=auto] - Position of dropbox (top, bottom, auto)
   * @property {string} [placeholder=Select] - Text to show when no options selected
   * @property {string} [noOptionsText=No results found] - Text to show when no options to show
   * @property {array} [disabledOptions] - Options to disable (array of values)
   */
  constructor(options) {
    try {
      this.valueKey = options.valueKey || 'value';
      this.labelKey = options.labelKey || 'label';
      this.optionsCount = options.optionsCount || 5;
      this.halfOptionsCount = Math.ceil(this.optionsCount / 2);
      this.optionHeightText = options.optionHeight || '40px';
      this.optionHeight = parseFloat(this.optionHeightText);
      this.multiple = options.multiple ? true : false;
      this.hasSearch = options.search ? true : false;
      this.hideClearButton = options.hideClearButton ? true : false;
      this.noOptionsText = options.noOptionsText || 'No results found';
      this.placeholder = options.placeholder || 'Select';
      this.position = options.position || 'auto';
      this.selectedValues = [];
      this.events = {};
      this.tooltipEnterDelay = 500;
      this.maximumValuesToShow = 50;
      this.transitionDuration = 250;
      this.searchValue = '';
      this.optionsHeight = (this.optionsCount * this.optionHeight) + 'px';
      this.$ele = options.ele;

      if (options.search === undefined && this.multiple) {
        this.hasSearch = true;
      }

      this.setDisabledOptions(options.disabledOptions);
      this.setOptions(options.options);
      this.render();
      this.addEvents();
      this.setMethods();
    } catch(e) {
      console.warn(`Couldn't initiate Virtual Select`);
      console.error(e);
    }
  }

  /* render - start */
  render() {
    if (!this.$ele) {
      return;
    }

    let wrapperClasses = 'vscomp-wrapper closed';
    let optionsStyleText = this.getStyleText({
      'max-height': this.optionsHeight,
    });

    if (optionsStyleText) {
      optionsStyleText = `style="${optionsStyleText}"`;
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
          <div class="vscomp-value" data-tooltip-enter-delay="${this.tooltipEnterDelay}">${this.placeholder}</div>
          <div class="vscomp-arrow"></div>
          <div class="vscomp-clear-button toggle-button-child" data-tooltip-enter-delay="${this.tooltipEnterDelay}" data-tooltip="Clear">&times;</div>
        </div>
        <div class="vscomp-dropbox">
          <div class="vscomp-search-wrapper"></div>
          <div class="vscomp-options-container" ${optionsStyleText}>
            <div class="vscomp-options-list">
              <div class="vscomp-options"></div>
            </div>
          </div>
          <div class="vscomp-no-options">${this.noOptionsText}</div>
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

    this.renderSearch();
    this.setOptionsHeight();
    this.setVisibleOptions();
  }

  renderOptions() {
    let html = '';
    let labelKey = this.labelKey;
    let visibleOptions = this.getVisibleOptions();
    let checkboxHtml = '';
    let styleText = this.getStyleText({
      height: this.optionHeight + 'px',
    });

    if (styleText) {
      styleText = `style="${styleText}"`;
    }

    if (this.multiple) {
      checkboxHtml = '<span class="checkbox-icon"></span>';
    }

    visibleOptions.forEach(d => {
      let optionLabel = d[labelKey];
      let optionClasses = 'vscomp-option';

      if (d.isSelected) {
        optionClasses += ' selected';
      }

      if (d.isFocused) {
        optionClasses += ' focused';
      }

      if (d.isDisabled) {
        optionClasses += ' disabled';
      }

      html += `<div class="${optionClasses}" data-value="${d.value}" data-index="${d.index}" ${styleText}>
          ${checkboxHtml}
          <span class="vscomp-option-text" data-tooltip="${optionLabel}" data-tooltip-enter-delay="${this.tooltipEnterDelay}">
            ${optionLabel}
          </span>
        </div>`;
    });

    this.$options.innerHTML = html;
    this.toggleClass(this.$wrapper, 'has-no-options', !visibleOptions.length);
    this.setOptionsPosition();
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
  /* render - end */

  /* events - start */
  addEvents() {
    this.addEvent(document, 'click', 'onDocumentClick');
    this.addEvent(this.$wrapper, 'keydown', 'onKeyDown');
    this.addEvent(this.$toggleButton, 'click', 'onToggleButtonClick');
    this.addEvent(this.$clearButton, 'click', 'onClearButtonClick');
    this.addEvent(this.$optionsContainer, 'scroll', 'onOptionsScroll');
    this.addEvent(this.$options, 'click', 'onOptionsClick');
    this.addEvent(this.$options, 'mouseover', 'onOptionsMouseOver');
  }

  addEvent($ele, events, method) {
    if (!$ele) {
      return;
    }

    events = this.removeArrayEmpty(events.split(' '));

    events.forEach(event => {
      let eventsKey = `${method}-${event}`;
      let callback = this.events[eventsKey];
  
      if (!callback) {
        callback = this[method].bind(this);
        this.events[eventsKey] = callback;
      }
  
      $ele = this.getElements($ele);
  
      $ele.forEach(_this => {
        _this.addEventListener(event, callback);
      });
    });
  }

  dispatchEvent($ele, eventName) {
    if (!$ele) {
      return;
    }

    $ele = this.getElements($ele);

    $ele.forEach(_this => {
      _this.dispatchEvent(new Event(eventName));
    });
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
  /* events - end */

  openDropbox(isSilent) {
    this.setDropboxPosition();
    this.removeClass(this.$wrapper, 'closed');

    setTimeout(() => {
      this.addClass(this.$wrapper, 'opened');

      if (!isSilent) {
        this.addClass(this.$wrapper, 'focused');
      }

      this.focusSearchInput();
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
      $newFocusedEle = this.$dropbox.querySelector(`.vscomp-option[data-index="${firstVisibleOptionIndex}"]`);

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

  getSibling($ele, direction) {
    let propName = direction === 'next' ? 'nextElementSibling' : 'previousElementSibling';

    do {
      if ($ele) {
        $ele = $ele[propName];
      }
    } while(this.hasClass($ele, 'disabled'));

    return $ele;
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

    if (!isAdding && !this.multiple) {
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
        let $prevSelectedOption = this.$ele.querySelector('.vscomp-option.selected');
        selectedValues = [selectedValue];
        this.closeDropbox();
        
        if ($prevSelectedOption) {
          this.toggleClass($prevSelectedOption, 'selected', false);
          this.toggleSelectedProp(this.getData($prevSelectedOption, 'index'), false);
        }
      }

      this.toggleClass($ele, 'selected');
    } else {
      if (this.multiple) {
        this.toggleClass($ele, 'selected');
        this.removeItemFromArray(selectedValues, selectedValue);
        this.toggleAllOptionsClass(false);
      }
    }

    this.setValue(selectedValues, true);
  }

  selectFocusedOption() {
    this.selectOption(this.$dropbox.querySelector('.vscomp-option.focused'));
  }

  toggleAllOptions(isSelected) {
    if (typeof isSelected !== 'boolean') {
      isSelected = !this.hasClass(this.$toggleAllOptions, 'checked');
    }

    let selectedValues = [];

    this.options.forEach(d => {
      if (d.isDisabled) {
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
        isAllSelected = !this.options.some(d => {
          return !d.isSelected && !d.isDisabled;
        });
      }
    }

    this.toggleClass(this.$toggleAllOptions, 'checked', isAllSelected);
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

  setMethods() {
    let $ele = this.$ele;
    $ele.virtualSelect = this;
    $ele.value = this.multiple ? [] : '';
    $ele.reset = VirtualSelect.reset;
    $ele.setValue = VirtualSelect.setValueMethod;
    $ele.setOptions = VirtualSelect.setOptionsMethod;
    $ele.setDisabledOptions = VirtualSelect.setDisabledOptionsMethod;
  }

  setValueMethod(value, silentChange) {
    if (!Array.isArray(value)) {
      value = [value];
    }

    value = value.map(v => {
      return (v || v == 0) ? v.toString() : '';
    });

    let validValues = [];

    this.options.forEach(d => {
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

  reset() {
    this.options.forEach(d => {
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

  setDisabledOptions(disabledOptions = [], setOptionsProp = false) {
    disabledOptions = disabledOptions.map(d => d.toString());
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
    let valueKey = this.valueKey;
    let labelKey = this.labelKey;
    this.visibleOptionsCount = options.length;

    this.options = options.map((d, i) => {
      let value = d[valueKey].toString();
      d.index = i;
      d.value = value;
      d.label = d[labelKey];
      d.isVisible = true;

      if (hasDisabledOptions) {
        d.isDisabled = disabledOptions.indexOf(value) !== -1;
      }

      return d;
    });
  }

  setVisibleOptions() {
    let visibleOptions = [...this.options];
    let maxOptionsToShow = this.optionsCount * 2;
    let startIndex = this.getVisibleStartIndex();
    let endIndex = startIndex + maxOptionsToShow - 1;
    let i = 0;

    visibleOptions = visibleOptions.filter((d) => {
      let inView = false;

      if (d.isVisible) {
        inView = i >= startIndex && i <= endIndex;
        i++;
      }

      return inView;
    });

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

  setValue(value, triggerEvent) {
    if (!value) {
      this.selectedValues = [];
    } else if (Array.isArray(value)) {
      this.selectedValues = [...value];
    } else {
      this.selectedValues = [value];
    }

    this.$ele.value = this.multiple ? this.selectedValues : (this.selectedValues[0] || '');
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
    let maximumValuesToShow = this.maximumValuesToShow;
    
    let selectedValuesCount = 0;

    for (let d of this.options) {
      if (selectedValuesCount > maximumValuesToShow) {
        break;
      }

      let value = d.value;

      if (selectedValue.indexOf(value) !== -1) {
        let label = d[this.labelKey];
        valueText.push(label);
        valueTooltip.push(`<span class="vscomp-value-tag">${label}</span>`);
        selectedValuesCount++;
      }
    }

    let moreSelectedOptions =  selectedValue.length - maximumValuesToShow;

    if (moreSelectedOptions > 0) {
      valueTooltip.push(`<span class="vscomp-value-tag">+ ${moreSelectedOptions} more...</span>`);
    }
    
    this.$valueText.innerHTML = valueText.join(', ') || this.placeholder;
    this.setData(this.$valueText, 'tooltip', valueTooltip.join(', '));
  }

  setSearchValue(value, skipInputSet) {
    if (value === this.searchValue) {
      return;
    }

    if (!skipInputSet) {
      this.$searchInput.value = value;
    }

    let searchValue = value.toLowerCase().trim();
    let visibleOptionsCount = 0;
    this.searchValue = searchValue;

    this.options.forEach((d) => {
      let value = d.label.toString().toLowerCase();
      let isVisible = value.indexOf(searchValue) !== -1;
      d.isVisible = isVisible;

      if (isVisible) {
        visibleOptionsCount++;
      }
    });

    this.visibleOptionsCount = visibleOptionsCount;

    this.toggleClass(this.$wrapper, 'has-search-value', value);
    this.scrollToTop();
    this.setOptionsHeight();
    this.setVisibleOptions();
  }

  setOptionProp(index, key, value) {
    if (isNaN(index) || index === null) {
      return;
    }

    this.options[index][key] = value;
  }

  setData($ele, name, value) {
    if ($ele) {
      $ele.dataset[name] = value;
    }
  }

  setOptionsHeight() {
    this.$optionsList.style.height = (this.optionHeight * this.visibleOptionsCount) + 'px';
  }

  setDropboxPosition() {
    if (this.position !== 'auto') {
      return;
    }

    let moreVisibleSides = this.getMoreVisibleSides(this.$wrapper);
    this.toggleClass(this.$wrapper, 'position-top', moreVisibleSides.vertical === 'top');
  }

  getVisibleOptions() {
    return this.visibleOptions || [];
  }

  getValue() {
    return this.multiple ? this.selectedValues : this.selectedValues[0];
  }

  getStyleText(props) {
    let result = '';

    for (let k in props) {
      result += `${k}: ${props[k]};`;
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
  /* helpers - start */

  addClass($ele, className) {
    if (!$ele) {
      return;
    }

    className = className.split(' ');

    this.getElements($ele).forEach(_this => {
      _this.classList.add(...className);
    });
  }

  removeClass($ele, className) {
    if (!$ele) {
      return;
    }

    className = className.split(' ');

    this.getElements($ele).forEach(_this => {
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

    this.getElements($ele).forEach(_this => {
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
    } else if (typeof(value) === 'object') {
      if (Object.keys(value).length === 0) {
        result = true;
      }
    }

    return result;
  }

  isNotEmpty(value) {
    return !this.isEmpty(value);
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

    return array.filter(d => !!d);
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
  /* helpers - end */

  /* static methods - start */
  static init(options) {
    let $eleArray = options.ele;

    if (!$eleArray) {
      return;
    }

    let singleEle = false;

    if (typeof($eleArray) === 'string') {
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
    document.querySelectorAll('.vscomp-wrapper').forEach($ele => {
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

    $form.querySelectorAll('.vscomp-wrapper').forEach($ele => {
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
  /* static methods - start */
}

document.addEventListener('reset', VirtualSelect.resetForm);

window.VirtualSelect = VirtualSelect;