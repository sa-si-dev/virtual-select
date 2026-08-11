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
  46: 'onBackspaceOrDeletePress', // Delete
  8: 'onBackspaceOrDeletePress', // Backspace
};

const valueLessProps = ['autofocus', 'disabled', 'multiple', 'required'];
const nativeProps = ['autofocus', 'class', 'disabled', 'id', 'multiple', 'name', 'placeholder', 'required'];
// Deferred: the value comes from VirtualSelect.getAttrProps(), so it cannot be assigned until
// the class below has been evaluated (see the assignment at the bottom of this file).
// eslint-disable-next-line prefer-const
let attrPropsMapping;

const dataProps = [
  'additionalClasses',
  'additionalDropboxClasses',
  'additionalDropboxContainerClasses',
  'additionalToggleButtonClasses',
  'aliasKey',
  'allOptionsSelectedText',
  'allowNewOption',
  'alwaysShowSelectedOptionsCount',
  'alwaysShowSelectedOptionsLabel',
  'ariaLabelledby',
  'ariaLabelText',
  'ariaLabelClearButtonText',
  'ariaLabelTagClearButtonText',
  'ariaLabelSearchClearButtonText',
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
  'loadingText',
  'minValuesErrorText',
  'moreText',
  'noOfDisplayValues',
  'noOptionsSelectedText',
  'noOptionsText',
  'noSearchResultsText',
  'optionHeight',
  'optionSelectedText',
  'optionsCount',
  'optionsSelectedText',
  'popupDropboxBreakpoint',
  'popupPosition',
  'position',
  'requiredErrorText',
  'search',
  'searchByStartsWith',
  'searchDelay',
  'searchFormLabel',
  'searchGroup',
  'searchNormalize',
  'searchPlaceholderText',
  'searchResultText',
  'searchResultsText',
  'selectAllOnlyVisible',
  'selectAllText',
  'selectedText',
  'setValueAsArray',
  'showDropboxAsPopup',
  'showOptionsOnlyOnSearch',
  'showSecureTextWarning',
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
    this.isDestroyed = false;

    try {
      this.createSecureTextElements();
      this.setProps(options);
      this.setDisabledOptions(options.disabledOptions);
      this.setOptions(options.options);
      this.warnIfSecureTextDisabled();
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
    let toggleButtonClasses = 'vscomp-toggle-button';
    const valueTooltip = this.showValueAsTags ? '' : this.getTooltipAttrText(this.placeholder, true, true);
    const clearButtonTooltip = this.getTooltipAttrText(this.clearButtonText);
    /**
     * These props are developer-supplied but still reach an attribute directly, and none of them
     * passes through secureText() - so enableSecureText never protected them. A double quote
     * closed the attribute early: the payload after it was parsed as markup, and the accessible
     * name kept only the prefix, which is a WCAG 4.1.2 defect as much as an injection.
     *
     * getAriaLabelText() for the accessible names, because it is what AI-14 already applies to
     * option and group labels: strip markup, then escape quotes. Plain quote escaping for
     * aria-labelledby, which is an IDREF list rather than prose - stripping tags there would hide
     * a caller error instead of fixing it.
     */
    const ariaLabelledbyText = this.ariaLabelledby
      ? `aria-labelledby="${Utils.replaceDoubleQuotesWithHTML(Utils.getString(this.ariaLabelledby))}"`
      : '';
    const ariaLabelText = this.ariaLabelText ? `aria-label="${Utils.getAriaLabelText(this.ariaLabelText)}"` : '';
    const ariaLabelClearBtnTxt = this.ariaLabelClearButtonText
      ? `aria-label="${Utils.getAriaLabelText(this.ariaLabelClearButtonText)}"`
      : '';
    let isExpanded = false;

    if (this.additionalClasses) {
      wrapperClasses += ` ${Utils.sanitizeClassNames(this.additionalClasses)}`;
    }

    if (this.additionalToggleButtonClasses) {
      toggleButtonClasses += ` ${Utils.sanitizeClassNames(this.additionalToggleButtonClasses)}`;
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
    const html =
      `<div id="vscomp-ele-wrapper-${uniqueId}" class="vscomp-ele-wrapper ${wrapperClasses}" tabindex="0"
        role="combobox" aria-haspopup="listbox" aria-controls="vscomp-dropbox-container-${uniqueId}"
        aria-expanded="${isExpanded}" ${ariaLabelledbyText} ${ariaLabelText}>
        <input type="hidden" class="vscomp-hidden-input">
        <div class="${toggleButtonClasses}">
          <div class="vscomp-value" ${valueTooltip}>
            ${this.placeholder}
          </div>
          <div class="vscomp-arrow"></div>
          <div class="vscomp-clear-button toggle-button-child" ${clearButtonTooltip} 
          tabindex="-1" role="button" ${ariaLabelClearBtnTxt}>
            <i class="vscomp-clear-icon"></i>
          </div>
        </div>

        ${this.renderDropbox({ wrapperClasses })}
      </div>

      <div id="vscomp-live-region-${uniqueId}" class="vscomp-live-region" role="status"
        aria-live="polite" aria-atomic="true"></div>

      <div id="vscomp-error-message-${uniqueId}" class="vscomp-error-message"></div>`;

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

    /**
     * The submitting field's name is set as a DOM property, not interpolated into the template.
     *
     * `name="${this.name}"` made the attribute an HTML sink: a double quote closed it early, so
     * the remainder of the value was parsed as markup (real elements, an injection) while the
     * field kept only the truncated prefix - or, when the payload also swallowed the following
     * `class="vscomp-hidden-input"`, no field was found at all and the first setValue() threw
     * inside the constructor. Either way the form silently stopped submitting the right name,
     * and that included legitimate names such as `items["a"]`.
     *
     * A property assignment performs no HTML parsing, so there is nothing to break out of and
     * nothing to escape - which is also why `name` no longer goes through secureText(): the
     * escaping only ever protected this sink, and applying it here corrupted the submitted
     * field name into `items[&quot;a&quot;]`.
     */
    this.$hiddenInput.name = this.name;

    /**
     * Both live outside the wrapper, as siblings, because the wrapper is the combobox: for an
     * instance mounted without ariaLabelText/ariaLabelledby the combobox takes its accessible
     * name from its contents, and visually-hidden text still joins that computation - so a
     * status update or validation message inside it would be read as part of the field's *name*.
     * A sibling can be announced (live region) or associated (aria-describedby) without that.
     */
    this.$liveRegion = this.$ele.querySelector('.vscomp-live-region');
    this.$errorMessage = this.$ele.querySelector('.vscomp-error-message');
    this.$dropbox = this.$dropboxContainer.querySelector('.vscomp-dropbox');
    this.$dropboxCloseButton = this.$dropboxContainer.querySelector('.vscomp-dropbox-close-button');
    this.$dropboxContainerBottom = this.$dropboxContainer.querySelector('.vscomp-dropbox-container-bottom');
    this.$dropboxContainerTop = this.$dropboxContainer.querySelector('.vscomp-dropbox-container-top');
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
    let dropboxClasses = 'vscomp-dropbox';

    if (this.additionalDropboxClasses) {
      dropboxClasses += ` ${Utils.sanitizeClassNames(this.additionalDropboxClasses)}`;
    }

    let dropboxContainerClasses = 'vscomp-dropbox-container';

    if (this.additionalDropboxContainerClasses) {
      dropboxContainerClasses += ` ${Utils.sanitizeClassNames(this.additionalDropboxContainerClasses)}`;
    }
    const html =
      `<div id="vscomp-dropbox-container-${this.uniqueId}" class="${dropboxContainerClasses}">
        <div class="vscomp-dropbox-container-top" aria-hidden="true" tabindex="-1">&nbsp;</div>
        <div class="${dropboxClasses}">
          <div class="vscomp-search-wrapper"></div>

          <div id="vscomp-options-container-${this.uniqueId}" class="vscomp-options-container" role="listbox"
            aria-labelledby="vscomp-ele-wrapper-${this.uniqueId}"
            ${this.multiple ? 'aria-multiselectable="true"' : ''}>
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
        <div class="vscomp-dropbox-container-bottom" aria-hidden="true" tabindex="-1">&nbsp;</div>
      </div>`;

    if ($wrapper) {
      const $dropboxWrapper = document.createElement('div');

      this.$dropboxWrapper = $dropboxWrapper;
      this.hasDropboxWrapper = true;
      $dropboxWrapper.innerHTML = html;

      $wrapper.appendChild($dropboxWrapper);
      DomUtils.addClass($dropboxWrapper, `vscomp-dropbox-wrapper ${wrapperClasses}`);

      if (!this.keepAlwaysOpen) {
        DomUtils.setAttr($dropboxWrapper, 'tabindex', '-1');
        DomUtils.setAria($dropboxWrapper, 'hidden', true);
      }

      return '';
    }

    this.hasDropboxWrapper = false;

    return html;
  }

  renderOptions() {
    /**
     * The ARIA scan walks every option, so running it per render made scrolling O(n) per
     * event (~3.9 ms/call at 100k). aria-setsize/aria-posinset only change when the
     * filtered set or its order changes, never when the virtualisation window moves, so
     * recompute on a dirty flag instead. Everything that alters the set marks it dirty.
     */
    if (this.ariaMetadataDirty) {
      this.calculateAriaMetadata();
      this.ariaMetadataDirty = false;
    }

    let html = '';
    const visibleOptions = this.getVisibleOptions();
    let checkboxHtml = '';
    let newOptionIconHtml = '';
    const markSearchResults = !!(this.markSearchResults && this.searchValue);
    let searchRegex;
    const { labelRenderer, disableOptionGroupCheckbox, uniqueId, searchGroup } = this;
    const hasLabelRenderer = typeof labelRenderer === 'function';
    const { convertToBoolean } = Utils;
    let groupName = '';

    if (markSearchResults) {
      /**
       * Search input is regex-escaped (no ReDoS). The (?!([^<]+)?>) lookahead avoids inserting
       * <mark> inside a tag; it relies on option labels being escaped via enableSecureText. When
       * enableSecureText is off, labels are rendered as raw HTML by design (the consumer opts into
       * this), so this highlight does not introduce an additional injection vector beyond the raw
       * HTML the consumer already chose to render.
       */
      searchRegex = new RegExp(`(${Utils.regexEscape(this.searchValue)})(?!([^<]+)?>)`, 'gi');
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
      let ariaLabel = '';
      let tabIndexValue = '-1';
      const isSelected = convertToBoolean(d.isSelected);
      let ariaDisabledText = '';

      if (d.classNames) {
        /** sanitize so a consumer-provided class string cannot break out of the class attribute */
        optionClasses += ` ${Utils.sanitizeClassNames(d.classNames)}`;
      }

      if (d.isFocused) {
        tabIndexValue = '0';
        optionClasses += ' focused';
      }

      if (d.isDisabled) {
        optionClasses += ' disabled';
        ariaDisabledText = 'aria-disabled="true"';
      }

      if (d.isGroupTitle) {
        /** carried into every child's aria-label below, so strip markup once here */
        groupName = Utils.getAriaLabelText(d.label);
        optionClasses += ' group-title';

        if (disableOptionGroupCheckbox) {
          leftSection = '';
        } else if (this.multiple) {
          const selectAllText = Utils.getAriaLabelText(this.selectAllText);
          ariaLabel = `aria-label="${groupName}, ${selectAllText}"`;
        }
      }

      if (isSelected) {
        optionClasses += ' selected';
      }

      if (d.isGroupOption) {
        optionClasses += ' group-option';
        groupIndexText = `data-group-index="${d.groupIndex}"`;

        if (d.customData) {
          /**
           * customData fields are interpolated into the aria-label attribute, so they must be
           * escaped the same way as label/value (via secureText). Otherwise a quote in
           * group_name/description can break out of the attribute even when enableSecureText
           * is on - an XSS bypass. secureText is a no-op when enableSecureText is disabled,
           * keeping the existing behaviour for consumers that intentionally pass raw text.
           */
          const groupNameText = Utils.getAriaLabelText(this.secureText(Utils.getString(d.customData.group_name)));
          const groupDescText = Utils.getAriaLabelText(this.secureText(Utils.getString(d.customData.description)));

          groupName = d.customData.group_name !== undefined ? `${groupNameText}, ` : '';
          const optionDesc = d.customData.description !== undefined ? ` ${groupDescText},` : '';

          ariaLabel = `aria-label="${groupName} ${Utils.getAriaLabelText(d.label)}, ${optionDesc}"`;
        } else {
          ariaLabel = `aria-label="${groupName}, ${Utils.getAriaLabelText(d.label)}"`;
        }
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

      // Add aria-setsize and aria-posinset for virtualized listbox accessibility
      let ariaAttrs = '';
      if (this.ariaSetSize > 0) {
        ariaAttrs = `aria-setsize="${this.ariaSetSize}"`;
        if (d.filteredIndex) {
          ariaAttrs += ` aria-posinset="${d.filteredIndex}"`;
        }
      }

      /**
       * The option value is an untrusted string going straight into an attribute, so a double
       * quote in it closed data-value early and everything after it was parsed as markup - a
       * value of `x" data-pwned="1" z="` put a live data-pwned attribute on the option row,
       * whether or not enableSecureText was on.
       *
       * `&` is escaped here as well as `"`, because the value is now stored verbatim (it reaches
       * no innerHTML sink, so escaping it only made the option unaddressable - see secureText).
       * Both together keep the attribute round-tripping: the parser turns `&amp;` and `&quot;`
       * back into `&` and `"`, and setOptionAttr() rewrites data-value through the DOM API on
       * every render anyway.
       */
      const optionValueAttr = Utils.escapeAttributeValue(d.value);

      html += `<div role="option" aria-selected="${isSelected}" id="vscomp-option-${uniqueId}-${index}"
          class="${optionClasses}" data-value="${optionValueAttr}" data-index="${index}"
          data-visible-index="${d.visibleIndex}"
          tabindex=${tabIndexValue} ${groupIndexText} ${ariaDisabledText} ${ariaLabel} ${ariaAttrs}
        >
          ${leftSection}
          <span class="vscomp-option-text" ${optionTooltip}>
            ${optionLabel}
          </span>
          ${description}
          ${rightSection}
        </div>`;
    });

    groupName = '';

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
      /**
       * role="checkbox" + aria-checked so the control is announced as a checkbox and its
       * state changes are audible. Without them it exposed as a generic element and every
       * select/deselect was silent to assistive technology (WCAG 4.1.2 / 1.3.1).
       * aria-checked is kept in sync by toggleAllOptionsClass().
       */
      /**
       * selectAllText has two sinks, and only the attribute one is escaped.
       *
       * The visible label below is rendered as HTML and that works today - `Pick <b>all</b>`
       * produces a real <b> - so escaping it would be a visible regression for anyone styling
       * the Select All label. The accessible name, by contrast, was raw: a quote broke out of
       * the attribute, and markup was announced as tag soup. getAriaLabelText() is the same
       * treatment the group-header aria-label a few methods up already applies to this exact
       * prop, which is why that sink was safe while this one was not.
       */
      checkboxHtml = `<span class="vscomp-toggle-all-button" tabindex="0" role="checkbox"
        aria-checked="false" aria-label="${Utils.getAriaLabelText(this.selectAllText)}">
          <span class="checkbox-icon vscomp-toggle-all-checkbox"></span>
          <span class="vscomp-toggle-all-label">${this.selectAllText}</span>
        </span>`;
    }

    if (this.hasSearch) {
      const ariaLabelSearchClearBtnTxt = this.ariaLabelSearchClearButtonText
        ? `aria-label="${Utils.getAriaLabelText(this.ariaLabelSearchClearButtonText)}"`
        : '';

      searchInput = `<label for="vscomp-search-input-${this.uniqueId}" class="vscomp-search-label"
        id="vscomp-search-label-${this.uniqueId}"
      >
        ${this.searchFormLabel}
      </label>
      <input type="text" class="vscomp-search-input"
        placeholder="${Utils.replaceDoubleQuotesWithHTML(Utils.getString(this.searchPlaceholderText))}"
        id="vscomp-search-input-${this.uniqueId}"
        aria-autocomplete="list"
        aria-controls="vscomp-options-container-${this.uniqueId}">
      <span class="vscomp-search-clear" role="button" ${ariaLabelSearchClearBtnTxt}>&times;</span>`;
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
    // Prevents the change event from bubbling and triggering the main onChange handler twice.
    this.addEvent(this.$searchInput, 'change', 'preventPropagation');
    this.addEvent(this.$searchClear, 'click keydown', 'onSearchClear');
    this.addEvent(this.$toggleAllButton, 'click', 'onToggleAllOptions');
    this.addEvent(this.$dropboxContainerBottom, 'focus', 'onDropboxContainerTopOrBottomFocus');
    this.addEvent(this.$dropboxContainerTop, 'focus', 'onDropboxContainerTopOrBottomFocus');
  }
  /** render methods - end */

  /** dom event methods - start */
  addEvents() {
    this.addEvent(document, 'click', 'onDocumentClick', true);
    this.addEvent(this.$allWrappers, 'keydown', 'onKeyDown');
    this.addEvent(this.$toggleButton, 'click keydown', 'onToggleButtonPress');
    this.addEvent(this.$clearButton, 'click keydown', 'onClearButtonClick');
    this.addEvent(this.$dropboxContainer, 'click', 'onDropboxContainerClick');
    this.addEvent(this.$dropboxCloseButton, 'click', 'onDropboxCloseButtonClick');
    this.addEvent(this.$optionsContainer, 'scroll', 'onOptionsScroll');
    this.addEvent(this.$options, 'click', 'onOptionsClick');
    this.addEvent(this.$options, 'mouseover', 'onOptionsMouseOver');
    this.addEvent(this.$options, 'touchmove', 'onOptionsTouchMove');
    VirtualSelect.registerInstance(this);
  }

  addEvent($ele, events, method, capture = false) {
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

      DomUtils.addEvent($ele, event, callback, capture);
    });
  }

  /** dom event methods - start */
  removeEvents() {
    /**
     * onDocumentClick is registered in the capture phase (see addEvents). The capture flag
     * MUST match here, otherwise removeEventListener is a no-op and the listener (and the
     * VirtualSelect instance + detached DOM it closes over) leaks on every destroy/re-render.
     */
    this.removeEvent(document, 'click', 'onDocumentClick', true);
    this.removeEvent(this.$allWrappers, 'keydown', 'onKeyDown');
    this.removeEvent(this.$toggleButton, 'click keydown', 'onToggleButtonPress');
    this.removeEvent(this.$clearButton, 'click keydown', 'onClearButtonClick');
    this.removeEvent(this.$dropboxContainer, 'click', 'onDropboxContainerClick');
    this.removeEvent(this.$dropboxCloseButton, 'click', 'onDropboxCloseButtonClick');
    this.removeEvent(this.$optionsContainer, 'scroll', 'onOptionsScroll');
    this.removeEvent(this.$options, 'click', 'onOptionsClick');
    this.removeEvent(this.$options, 'mouseover', 'onOptionsMouseOver');
    this.removeEvent(this.$options, 'touchmove', 'onOptionsTouchMove');

    // Remove search-related events that are added in renderSearch()
    if (this.$searchInput) {
      this.removeEvent(this.$searchInput, 'input', 'onSearch');
      this.removeEvent(this.$searchInput, 'change', 'preventPropagation');
      if (this.$searchClear) {
        this.removeEvent(this.$searchClear, 'click', 'onSearchClear');
        this.removeEvent(this.$searchClear, 'keydown', 'onSearchClear');
      }
    }
    if (this.$toggleAllButton) {
      this.removeEvent(this.$toggleAllButton, 'click', 'onToggleAllOptions');
    }
    if (this.$dropboxContainerBottom) {
      this.removeEvent(this.$dropboxContainerBottom, 'focus', 'onDropboxContainerTopOrBottomFocus');
    }
    if (this.$dropboxContainerTop) {
      this.removeEvent(this.$dropboxContainerTop, 'focus', 'onDropboxContainerTopOrBottomFocus');
    }
  }

  removeEvent($ele, events, method, capture = false) {
    if (!$ele) {
      return;
    }

    const eventsArray = Utils.removeArrayEmpty(events.split(' '));

    eventsArray.forEach((event) => {
      const eventsKey = `${method}-${event}`;
      const callback = this.events[eventsKey];

      if (callback) {
        DomUtils.removeEvent($ele, event, callback, capture);
      }
    });
  }

  onDocumentClick(e) {
    const $clickedEle = e.target.closest('.vscomp-wrapper');

    // Close all if clicking outside any dropdown
    if (!$clickedEle) {
      VirtualSelect.openInstances.forEach((instance) => {
        // Don't focus when closing due to clicking outside
        const instanceObj = instance;
        instanceObj.shouldFocusWrapperOnClose = false;
        instanceObj.closeDropbox();
      });
      return;
    }

    // If clicking a different dropdown, close current one
    const clickedInstance = $clickedEle.parentElement.virtualSelect;
    if (clickedInstance && clickedInstance !== this && this.isOpened() && !this.keepAlwaysOpen) {
      // Don't focus when closing due to another dropdown being opened
      this.shouldFocusWrapperOnClose = false;
      this.closeDropbox();
    }
  }

  onKeyDown(e) {
    const key = e.which || e.keyCode;
    const method = keyDownMethodMapping[key];

    if (document.activeElement === this.$searchInput && (!e.shiftKey && key === 9) && !this.multiple) {
      e.preventDefault();
      this.focusFirstVisibleOption();
    }

    /**
     * Space is the expected activation key for role="checkbox"; Enter is kept for
     * backwards compatibility. preventDefault stops Space from scrolling the page
     * (the previous behaviour, since the key was unhandled here).
     */
    if (document.activeElement === this.$toggleAllButton && (key === 13 || key === 32)) {
      e.preventDefault();
      this.toggleAllOptions();
      return;
    }

    /**
     * Escape must close the dropdown in every layout (WCAG 2.1.1 / 2.1.2).
     * The element that contains the focused node differs by layout: with an external
     * `dropboxWrapper` the dropbox is portalled out of $wrapper, so containment has to be
     * tested against $dropboxWrapper. In every other case - including the default
     * `dropboxWrapper: 'self'` on desktop - the dropbox lives inside $wrapper. Selecting
     * $dropboxWrapper unconditionally for non-popup layouts left it `undefined` under the
     * default config, so the branch never ran and Escape did nothing.
     */
    if (key === 27 || e.key === 'Escape') {
      const wrapper = this.hasDropboxWrapper && !this.showAsPopup ? this.$dropboxWrapper : this.$wrapper;
      if (
        wrapper &&
        (document.activeElement === wrapper || wrapper.contains(document.activeElement)) &&
        !this.keepAlwaysOpen
      ) {
        this.closeDropbox();
        return;
      }
    }

    if (method) {
      this[method](e);
    }
  }

  onEnterPress(e) {
    e.preventDefault();

    if (this.isOpened()) {
      this.selectFocusedOption();
    } else if (this.$ele.disabled === false) {
      this.openDropbox();
    }
  }

  /**
   * Move the highlight without moving DOM focus.
   *
   * Previously both arrow handlers bailed out whenever the search input had focus, to let
   * the caret move. But opening the dropdown focuses the search input, so in the default
   * flow the arrows did nothing at all and no option was ever highlighted (WCAG 2.1.1).
   * The APG editable-combobox pattern is what applies here: Up/Down drive the list while
   * focus stays in the field, and the active option is published as aria-activedescendant.
   *
   * @param {KeyboardEvent} e
   * @param {'next' | 'previous'} direction
   */
  navigateOptions(e, direction) {
    e.preventDefault();

    if (this.isOpened()) {
      this.focusOption({ direction });
    } else {
      this.openDropbox();
    }
  }

  onDownArrowPress(e) {
    this.navigateOptions(e, 'next');
  }

  onUpArrowPress(e) {
    this.navigateOptions(e, 'previous');
  }

  onBackspaceOrDeletePress(e) {
    if (e.target === this.$wrapper) {
      e.preventDefault();
      if (this.selectedValues.length > 0) {
        this.reset();
      }
    }
  }

  onToggleButtonPress(e) {
    if (e.type === 'keydown') {
      // Allow default Tab navigation and other non-activation keys
      if (e.code !== 'Enter' && e.code !== 'Space') {
        return;
      }
      e.preventDefault();
    }

    const $target = e.target;

    if ($target.closest('.vscomp-value-tag-clear-button')) {
      e.stopPropagation();
      this.removeValue($target.closest('.vscomp-value-tag'));
      return;
    }

    if (!$target.closest('.toggle-button-child')) {
      // Let the event bubble normally
      this.toggleDropbox();
    }
  }

  onClearButtonClick(e) {
    if (e.type === 'click') {
      this.reset();
    } else if (e.type === 'keydown' && (e.code === 'Enter' || e.code === 'Space')) {
      e.stopPropagation();
      this.reset();
    }
  }

  /**
   * Scroll fires many times per drag and each event triggered a full re-render
   * (~9.5 ms at 100k unthrottled, ~44 ms at 4x CPU), so the main thread stayed blocked for
   * the whole gesture. Coalesce into at most one re-render per animation frame; the pending
   * frame is cancelled in destroy() so it cannot run against a torn-down instance.
   */
  onOptionsScroll() {
    if (this.scrollAnimationFrame) {
      return;
    }

    this.scrollAnimationFrame = requestAnimationFrame(() => {
      this.scrollAnimationFrame = null;

      if (this.isDestroyed) {
        return;
      }

      this.setVisibleOptions(true);
    });
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

    /**
     * isClosingTransition: isOpened() stays true for the ~200ms of the popover's hide
     * transition, so without the extra gate a pointer resting over the fading list kept
     * driving it - re-highlighting options, re-writing aria-activedescendant on a combobox
     * that had just announced itself collapsed, and (because taking the highlight takes DOM
     * focus) pulling focus back into a subtree about to be marked aria-hidden. A closing
     * dropbox ignores the pointer. Clicks and arrow keys are deliberately not gated - that
     * would change what mid-fade interactions *do*, where this only stops a passive hover
     * from mutating state; see AI-32 in ACTION-ITEMS.md.
     */
    if ($ele && this.isOpened() && !this.isClosingTransition) {
      if (this.shouldSkipOptionInNavigation($ele)) {
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

  preventPropagation(e) {
    e.stopPropagation();
  }

  onSearchClear(e) {
    e.stopPropagation();
    if (e.code === 'Enter' || e.code === 'Space' || e.type === 'click') {
      this.setSearchValue('');
      this.focusSearchInput();
    }
  }

  onToggleAllOptions() {
    this.toggleAllOptions();
  }

  onDropboxContainerTopOrBottomFocus() {
    this.closeDropbox();
  }

  onResize() {
    this.setOptionsContainerHeight(true);
  }

  /**
   * Single shared observer (instead of one body-wide subtree observer per instance) that
   * self-destroys any VirtualSelect whose host element is removed from the DOM. This works
   * in every mode - so removing the element without calling destroy() no longer leaks the
   * addEvents() listeners (notably the capture-phase document click listener that retains
   * the instance and its DOM). Inspecting removedNodes makes the cost proportional to the
   * number of removed nodes rather than the number of live instances.
   */
  static observeDomChanges() {
    if (VirtualSelect.domObserver) {
      return;
    }

    VirtualSelect.domObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach(($node) => {
          if ($node.nodeType !== Node.ELEMENT_NODE) {
            return;
          }

          const $eles = $node.classList.contains('vscomp-ele') ? [$node] : [];
          $node.querySelectorAll('.vscomp-ele').forEach(($ele) => $eles.push($ele));

          $eles.forEach(($ele) => {
            /** isConnected is false only when the node was genuinely detached (not moved/re-added) */
            if (!$ele.isConnected && $ele.virtualSelect) {
              $ele.virtualSelect.destroy();
            }
          });
        });
      });
    });

    VirtualSelect.domObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  /**
   * Disconnect and release the shared DOM observer. Called when the last instance is
   * destroyed so the observer does not keep running (or retain its callback) for the
   * lifetime of the page once no VirtualSelect remains.
   */
  static disconnectDomObserver() {
    if (VirtualSelect.domObserver) {
      VirtualSelect.domObserver.disconnect();
      VirtualSelect.domObserver = null;
    }
  }

  /**
   * Attach the page-level listeners (resize / form reset / form submit) once, on the first
   * live instance. Idempotent.
   */
  static addGlobalListeners() {
    if (VirtualSelect.hasGlobalListeners) {
      return;
    }

    document.addEventListener('reset', VirtualSelect.onFormReset);
    document.addEventListener('submit', VirtualSelect.onFormSubmit);
    window.addEventListener('resize', VirtualSelect.onResizeThrottled);
    VirtualSelect.hasGlobalListeners = true;
  }

  /**
   * Remove the page-level listeners. The same stable references used in addGlobalListeners
   * are passed so removeEventListener actually unregisters them, and the throttled resize
   * handler's pending trailing call is cancelled so it cannot fire after teardown.
   */
  static removeGlobalListeners() {
    if (!VirtualSelect.hasGlobalListeners) {
      return;
    }

    document.removeEventListener('reset', VirtualSelect.onFormReset);
    document.removeEventListener('submit', VirtualSelect.onFormSubmit);
    window.removeEventListener('resize', VirtualSelect.onResizeThrottled);

    if (VirtualSelect.onResizeThrottled && typeof VirtualSelect.onResizeThrottled.cancel === 'function') {
      VirtualSelect.onResizeThrottled.cancel();
    }

    VirtualSelect.hasGlobalListeners = false;
  }

  /**
   * Track a live instance and make sure the shared observer and page-level listeners exist.
   * Called once per instance from addEvents().
   */
  static registerInstance(instance) {
    VirtualSelect.activeInstances.add(instance);
    VirtualSelect.addGlobalListeners();
    VirtualSelect.observeDomChanges();
  }

  /**
   * Stop tracking an instance. When the last one goes away, tear down the page-level
   * listeners and the shared observer so nothing global outlives the components.
   */
  static unregisterInstance(instance) {
    VirtualSelect.activeInstances.delete(instance);

    if (VirtualSelect.activeInstances.size === 0) {
      VirtualSelect.removeGlobalListeners();
      VirtualSelect.disconnectDomObserver();
    }
  }

  /** dom event methods - end */
  /** before event methods - start */
  beforeValueSet(isReset) {
    this.toggleAllOptionsClass(isReset ? false : undefined);
  }

  beforeSelectNewValue(selectedValue) {
    const newOption = this.getNewOption();

    if (newOption) {
      const newIndex = newOption.index;

      this.newValues.push(newOption.value);
      this.setOptionProp(newIndex, 'isCurrentNew', false);
      this.setOptionProp(newIndex, 'isNew', true);
    } else if (selectedValue) {
      // In single-select flow the temporary current-new option can be removed
      // when dropdown close resets search, so re-add as a persisted new option.
      this.setNewOption(selectedValue);
      this.toggleSelectedProp(this.lastOptionIndex, true);
    }

    /** using setTimeout to fix the issue of dropbox getting closed on select */
    this.setManagedTimeout(() => {
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
    this.setVisibleOptionsCount();
    this.setOptionsContainerHeight();
    this.addEvents();

    /**
     * addEvents() registers this instance (installing the shared observer and the page-level
     * listeners). If any of the steps below throw, the instance is registered but the caller
     * has no handle to destroy() it, leaking the global listeners/observer. Self-destroy on
     * failure and rethrow so the constructor's existing handling still reports the error.
     */
    try {
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

      /**
       * Marks the end of construction. Live-region announcements are suppressed until
       * here so an initial value or the first render does not speak on page load.
       */
      this.isInitialized = true;
    } catch (e) {
      this.destroy();
      throw e;
    }
  }

  afterRenderOptions() {
    const visibleOptions = this.getVisibleOptions();
    const hasNoOptions = !this.options.length && !this.hasServerSearch;
    const hasNoSearchResults = !hasNoOptions && !visibleOptions.length;

    if (!this.allowNewOption || this.hasServerSearch || this.showOptionsOnlyOnSearch) {
      DomUtils.toggleClass(this.$allWrappers, 'has-no-search-results', hasNoSearchResults);
      if (hasNoSearchResults) {
        DomUtils.setAttr(this.$noSearchResults, 'tabindex', '0');
        DomUtils.setAttr(this.$noSearchResults, 'aria-hidden', 'false');
      } else {
        DomUtils.setAttr(this.$noSearchResults, 'tabindex', '-1');
        DomUtils.setAttr(this.$noSearchResults, 'aria-hidden', 'true');
      }
    }

    DomUtils.toggleClass(this.$allWrappers, 'has-no-options', hasNoOptions);
    if (hasNoOptions) {
      DomUtils.setAttr(this.$noOptions, 'tabindex', '0');
      DomUtils.setAttr(this.$noOptions, 'aria-hidden', 'false');
    } else {
      DomUtils.setAttr(this.$noOptions, 'tabindex', '-1');
      DomUtils.setAttr(this.$noOptions, 'aria-hidden', 'true');
    }

    this.setOptionAttr();
    this.setOptionsPosition();
    this.setOptionsTooltip();

    if (document.activeElement !== this.$searchInput) {
      this.setManagedTimeout(() => {
        const focusedOption = DomUtils.getElementsBySelector('.focused', this.$dropboxContainer)[0];
        if (focusedOption !== undefined) {
          focusedOption.focus({ preventScroll: true });
        }
      }, 20);
    }
  }

  afterSetOptionsContainerHeight(reset) {
    if (reset && this.showAsPopup) {
      this.setVisibleOptions();
    }
  }

  afterSetSearchValue() {
    if (this.hasServerSearch) {
      clearTimeout(this.serverSearchTimeout);

      /**
       * A search the user types is never silent, whatever state a previous close left behind.
       * The other half of the lifecycle lives in closeDropbox()/openDropbox(): closing marks
       * the instance silent *after* its own setSearchValue('') runs, so it does not matter
       * what this assignment does during the close - but it must not matter, which is why
       * this is unconditional rather than `= this.isClosing`.
       */
      this.isSilentServerSearch = false;

      this.serverSearchTimeout = setTimeout(() => {
        this.serverSearch();
      }, this.searchDelay);
    } else {
      this.setVisibleOptionsCount();
    }

    if (this.selectAllOnlyVisible) {
      this.toggleAllOptionsClass();
    }

    /** a closing dropbox must not take a highlight back - see closeDropbox() */
    if (!this.isClosing) {
      this.focusOption({ focusFirst: true });
    }

    if (!this.hasServerSearch) {
      this.announceSearchResults();
    }
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
      /**
       * reset() validates, and validation announces - so replacing the options used to speak a
       * validation failure for an interaction the user never made. Scoped to this one call rather
       * than the whole method, and released in a finally: a stuck flag would silently suppress
       * every later error announcement, which is far harder to diagnose than an exception (the
       * lesson from the isClosing guard in closeDropbox()).
       */
      this.isRefreshingOptions = true;

      try {
        this.reset();
      } finally {
        this.isRefreshingOptions = false;
      }
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
    this.showSecureTextWarning = convertToBoolean(options.showSecureTextWarning, true);
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
    this.searchNormalize = options.searchNormalize;
    this.searchPlaceholderText = options.searchPlaceholderText;
    this.searchFormLabel = options.searchFormLabel;
    this.optionsSelectedText = options.optionsSelectedText;
    this.optionSelectedText = options.optionSelectedText;
    this.allOptionsSelectedText = options.allOptionsSelectedText;
    /** live-region announcement texts (see announce/getResultsCountMessage) */
    this.searchResultsText = options.searchResultsText;
    this.searchResultText = options.searchResultText;
    this.noOptionsSelectedText = options.noOptionsSelectedText;
    this.selectedText = options.selectedText;
    this.loadingText = options.loadingText;
    this.requiredErrorText = options.requiredErrorText;
    this.minValuesErrorText = options.minValuesErrorText;
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
    this.noOfDisplayValues = parseInt(options.noOfDisplayValues, 10);
    this.zIndex = parseInt(options.zIndex, 10);
    this.maxValues = parseInt(options.maxValues, 10);
    this.minValues = parseInt(options.minValues, 10);
    /** not escaped: the only sink is the hidden input's `name` *property* (see renderWrapper) */
    this.name = options.name;
    this.additionalClasses = options.additionalClasses;
    this.additionalDropboxClasses = options.additionalDropboxClasses;
    this.additionalDropboxContainerClasses = options.additionalDropboxContainerClasses;
    this.additionalToggleButtonClasses = options.additionalToggleButtonClasses;
    this.popupDropboxBreakpoint = options.popupDropboxBreakpoint;
    this.popupPosition = options.popupPosition;
    this.onServerSearch = options.onServerSearch;
    this.labelRenderer = options.labelRenderer;
    this.selectedLabelRenderer = options.selectedLabelRenderer;
    this.initialSelectedValue = options.selectedValue === 0 ? '0' : options.selectedValue;
    this.emptyValue = options.emptyValue;
    this.ariaLabelText = options.ariaLabelText;
    this.ariaLabelledby = options.ariaLabelledby;
    this.ariaLabelClearButtonText = options.ariaLabelClearButtonText;
    this.ariaLabelTagClearButtonText = options.ariaLabelTagClearButtonText;
    this.ariaLabelSearchClearButtonText = options.ariaLabelSearchClearButtonText;

    this.maxWidth = options.maxWidth;
    this.searchDelay = options.searchDelay;

    this.showDuration = parseInt(options.showDuration, 10);
    this.hideDuration = parseInt(options.hideDuration, 10);

    /**
     * The open/close animation is driven from JS as well as CSS, so the stylesheet's
     * prefers-reduced-motion rule alone would still leave the popover animating for
     * showDuration/hideDuration milliseconds. Honour the preference here too.
     */
    if (Utils.prefersReducedMotion()) {
      this.showDuration = 0;
      this.hideDuration = 0;
    }

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
    this.shouldFocusWrapperOnClose = true; // Initialize focus management property
    this.isClosing = false;
    /** true from closeDropbox() until the next openDropbox() - see closeDropbox() */
    this.isSilentServerSearch = false;
    this.ariaSetSize = 0;
    this.ariaMetadataDirty = true;
  }

  /**
   * @param {virtualSelectOptions} options
   */
  setDefaultProps(options) {
    const globalDefaults = VirtualSelect.globalDefaults;

    /**
     * Resolve a prop across the precedence chain for the few defaults that are derived
     * from another prop, so a page-level default still drives them.
     * @param {string} key
     */
    const resolve = (key) => (options[key] !== undefined ? options[key] : globalDefaults[key]);
    const keepAlwaysOpen = resolve('keepAlwaysOpen');
    const hasOptionDescription = resolve('hasOptionDescription');

    const defaultOptions = {
      dropboxWrapper: 'self',
      valueKey: 'value',
      labelKey: 'label',
      descriptionKey: 'description',
      aliasKey: 'alias',
      ariaLabelText: 'Options list',
      ariaLabelClearButtonText: 'Clear button',
      ariaLabelTagClearButtonText: 'Remove option',
      ariaLabelSearchClearButtonText: 'Clear search input',
      optionsCount: 5,
      noOfDisplayValues: 50,
      optionHeight: '40px',
      noOptionsText: 'No options found',
      noSearchResultsText: 'No results found',
      selectAllText: 'Select All',
      searchNormalize: false,
      searchPlaceholderText: 'Search...',
      searchFormLabel: 'Search',
      clearButtonText: 'Clear',
      moreText: 'more...',
      optionsSelectedText: 'options selected',
      optionSelectedText: 'option selected',
      /** live-region announcements (WCAG 4.1.3) - overridable for localisation */
      searchResultsText: 'results available',
      searchResultText: 'result available',
      noOptionsSelectedText: 'No options selected',
      selectedText: 'selected',
      loadingText: 'Loading results',
      /** validation messages; {count} in minValuesErrorText is replaced with minValues */
      requiredErrorText: 'This field is required',
      minValuesErrorText: 'Select at least {count} options',
      allOptionsSelectedText: 'All',
      placeholder: 'Select',
      position: 'bottom left',
      zIndex: keepAlwaysOpen ? 1 : 2,
      tooltipFontSize: '14px',
      tooltipAlignment: 'center',
      tooltipMaxWidth: '300px',
      updatePositionThrottle: 100,
      name: '',
      additionalClasses: '',
      additionalDropboxClasses: '',
      additionalDropboxContainerClasses: '',
      additionalToggleButtonClasses: '',
      maxValues: 0,
      showDropboxAsPopup: true,
      showSecureTextWarning: true,
      popupDropboxBreakpoint: '576px',
      popupPosition: 'center',
      hideValueTooltipOnSelectAll: true,
      emptyValue: '',
      searchDelay: 300,
      focusSelectedOptionOnOpen: true,
      showDuration: 300,
      hideDuration: 200,
    };

    if (hasOptionDescription) {
      defaultOptions.optionsCount = 4;
      defaultOptions.optionHeight = '50px';
    }

    /**
     * Precedence: per-instance options > page-level globals > built-in defaults.
     * Globals let a host turn a policy on once (notably enableSecureText) instead of
     * repeating it at every call site, while an instance can still opt out explicitly.
     */
    /**
     * `undefined` means "not supplied", so those keys are dropped before merging.
     *
     * Object.assign copies own enumerable keys *including* ones whose value is undefined, so a prop
     * forwarded from an unset variable - `enableSecureText: wrapper.sanitizeValues`, the shape a
     * host wrapper naturally produces - overwrote the page-level global instead of falling back to
     * it. A host could call setGlobalDefaults({ enableSecureText: true }) and still get escaping
     * off at every such call site, with nothing to show it had been overridden.
     *
     * This also makes the merge agree with the resolve() helper above, which already treats
     * undefined as absent; the two disagreed inside the same method.
     */
    const supplied = (source) => {
      const result = {};

      Object.keys(source || {}).forEach((key) => {
        if (source[key] !== undefined) {
          result[key] = source[key];
        }
      });

      return result;
    };

    return Object.assign(defaultOptions, supplied(globalDefaults), supplied(options));
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
    /** expose the constraint itself, not just the failure (WCAG 3.3.1) */
    DomUtils.toggleAria(this.$allWrappers, 'required', this.required);
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
    /**
     * Option values are untrusted strings used as keys, so every value-keyed lookup in this
     * file is built with Object.create(null) rather than `{}`.
     *
     * This is not about prototype pollution - `mapping['__proto__'] = true` on a plain object
     * calls the inherited setter, which ignores a non-object value, so nothing is written and
     * Object.prototype stays intact. The damage is to reads: `mapping['__proto__']` returns
     * the inherited Object.prototype, which is truthy but never `=== true`, and these lookups
     * all compare against `true`. An option whose value is `__proto__` was therefore
     * selectable by click (that path reads data-value, not a mapping) but invisible to
     * setValue / setDisabledOptions / setEnabledOptions, so a selection the app could read
     * back could not be restored - and under allowNewOption it was mistaken for an unknown
     * value and duplicated. A null prototype has no inherited members, so an arbitrary string
     * key behaves like any other.
     */
    const valuesMapping = Object.create(null);
    const valuesOrder = Object.create(null);
    let validValues = [];
    const isMultiSelect = this.multiple;
    // Normalize input value first
    let value = Utils.normalizeValues(newValue);

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
      // Compare with normalized option values
      const normalizedOptionValue = Utils.normalizeValues(d.value);
      if (valuesMapping[normalizedOptionValue] === true && !d.isDisabled && !d.isGroupTitle) {
        // eslint-disable-next-line no-param-reassign
        d.isSelected = true;
        // Store original value but compare with normalized value
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
      validValues.sort((a, b) => valuesOrder[Utils.normalizeValues(a)] - valuesOrder[Utils.normalizeValues(b)]);
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
    const valuesMapping = Object.create(null);

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
      const disabledOptionsMapping = Object.create(null);

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
      const enabledOptionsMapping = Object.create(null);

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
    const disabledOptionsMapping = Object.create(null);
    let hasEmptyValueOption = false;

    this.disabledOptions.forEach((d) => {
      disabledOptionsMapping[d] = true;
    });

    const prepareOption = (d) => {
      if (typeof d !== 'object') {
        // eslint-disable-next-line no-param-reassign
        d = { [valueKey]: d, [labelKey]: d };
      }

      /**
       * `value` is stored verbatim; only `label` and `description` are escaped.
       *
       * Escaping is for HTML sinks, and the value has none: it goes into the `data-value`
       * attribute (escaped there, at the boundary) and is otherwise only compared or used as a
       * map key. Escaping it stored an identity the caller could not name - `a&b` became
       * `a&amp;b`, so setValue(['a&b']) matched nothing and a value read back could not be set
       * again.
       *
       * The normalised search keys derive from the *raw* text for the same reason: they are
       * matched against what the user types into the search box, which is never HTML-escaped.
       * Deriving them from the escaped text meant no query could match text containing `&`,
       * `<` or `>`.
       */
      const rawValue = getString(d[valueKey]);
      const rawLabel = getString(d[labelKey]);
      const value = rawValue;
      const label = secureText(rawLabel);
      const childOptions = d.options;
      const isGroupTitle = !!childOptions;
      const option = {
        index,
        value,
        valueNormalized: value.toLowerCase(),
        label,
        labelNormalized: this.searchNormalize && rawLabel.trim() !== ''
          ? Utils.normalizeString(rawLabel).toLowerCase()
          : rawLabel.toLowerCase(),
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
        const rawDescription = getString(d[descriptionKey]);
        option.description = secureText(rawDescription);
        /** normalised from the raw text, so a query containing `&` can match - see above */
        option.descriptionNormalized = this.searchNormalize && rawDescription.trim() !== ''
          ? Utils.normalizeString(rawDescription).toLowerCase()
          : rawDescription.toLowerCase();
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
      const newOptionsValueMapping = Object.create(null);
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
    this.setVisibleOptionsCount();
    DomUtils.removeClass(this.$allWrappers, 'server-searching');

    /**
     * Replace the "loading" message with the outcome of the fetch - for an open dropdown.
     *
     * isOpened() alone is not enough: the `closed` class arrives with the hide transition,
     * so a response landing just after Escape still saw an "open" dropdown. The silent flag
     * (see closeDropbox) covers that window and the whole closed period; opening lifts it.
     *
     * The count always describes the list as rendered *now*, not the fetch that triggered it.
     * setServerOptions() carries no request identity, so responses cannot be matched to
     * searches - when a stale response overwrites the list of an open dropdown, what is
     * announced is exactly what the user sees, and the newer response re-announces when it
     * lands. The local path announces the currently visible matches on the same principle
     * (announceSearchResults additionally requires focus in the search input, which a
     * response arriving whenever the host answers cannot demand).
     */
    if (this.isInitialized && !this.isSilentServerSearch && this.isOpened()) {
      this.announce(this.getResultsCountMessage());
    }
  }

  setSelectedOptions() {
    this.selectedOptions = this.options.filter((d) => d.isSelected);
  }

  setSortedOptions() {
    /** order drives aria-posinset */
    this.ariaMetadataDirty = true;
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
    // update number of visible options
    this.visibleOptionsCount = visibleOptions.length;
    this.renderOptions();
  }

  setOptionsPosition(startIndex) {
    // We use the parseInt to fix a Chrome issue when dealing with decimal pixels in translate3d
    const top = parseInt((startIndex || this.getVisibleStartIndex()) * this.optionHeight, 10);
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
    // Normalize input value first
    const normalizedValue = Utils.normalizeValues(value);
    const isValidValue = (this.hasEmptyValueOption && normalizedValue === '') || normalizedValue;

    if (!isValidValue) {
      this.selectedValues = [];
    } else if (Array.isArray(normalizedValue)) {
      this.selectedValues = [...normalizedValue];
    } else {
      this.selectedValues = [normalizedValue];
    }

    const newValue = this.getValue();
    this.$ele.value = newValue;
    this.$hiddenInput.value = this.getInputValue(newValue);
    this.isMaxValuesSelected = !!(this.maxValues && this.maxValues <= this.selectedValues.length);

    this.toggleAllOptionsClass();
    this.setValueText();

    const hasValue = Utils.isNotEmpty(this.selectedValues);

    DomUtils.toggleClass(this.$allWrappers, 'has-value', hasValue);
    DomUtils.toggleClass(this.$allWrappers, 'max-value-selected', this.isMaxValuesSelected);

    DomUtils.setAttr(this.$clearButton, 'tabindex', hasValue ? '0' : '-1');
    DomUtils.setAria(this.$clearButton, 'hidden', hasValue === false);

    let isValid = true;

    if (!disableValidation) {
      isValid = this.validate();
    }

    /**
     * Selection changes are otherwise conveyed only by the (visual) value text.
     * Guarded on isInitialized so a value supplied at construction time is not
     * announced before the user has interacted with anything.
     *
     * Skipped when validation just failed. validate() announces its message through the same
     * polite region, and a polite region is read from its *final* content - so announcing the
     * selection summary here overwrote the validation message in the same tick and the user
     * never heard it. That silenced every interactive path (the clear button, deselecting below
     * minValues) while still setting aria-invalid and showing the message on screen, which is
     * the 3.3.1 failure this region exists to fix. The error is the more urgent of the two, and
     * it already implies the selection state.
     */
    if (this.isInitialized && isValid) {
      this.announce(this.getSelectionMessage());
    }

    if (!disableEvent) {
      DomUtils.dispatchEvent(this.$ele, 'change', true);
    }
  }

  setValueText() {
    const { multiple, selectedValues, noOfDisplayValues, showValueAsTags, $valueText, selectedLabelRenderer } = this;
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

        let { label } = d;

        if (typeof selectedLabelRenderer === 'function') {
          label = selectedLabelRenderer(d);
        }

        valueText.push(label);
        selectedValuesCount += 1;

        if (showValueAsTags) {
          /**
           * The tooltip is attached to the tag's *content* span, with ellipsisOnly, so the
           * tooltip plugin runs `scrollWidth > offsetWidth` on the real box at hover time.
           *
           * This used to be decided here, before the tag existed, by measuring the label
           * off-screen against `.vscomp-toggle-button` - an element ~73px wider than the space
           * the tag text actually gets, at that element's 14px rather than the tag's 12px. Both
           * errors are gone by construction once the rendered box is the measurement (#487).
           *
           * The content span rather than `.vscomp-value-tag`: the tag is `inline-flex` and its
           * content span carries `width: calc(100% - 24px)`, so the span clips while the tag
           * never reports an overflow of its own - measured, a clipped tag reads
           * scrollWidth 260 / offsetWidth 262.
           *
           * Deferring to hover also means no layout work at render, and a correct answer after
           * a resize or when the control is first rendered inside a hidden container - none of
           * which a render-time measurement can give. It matches how the non-tag value text has
           * always worked (see getToggleButtonHtml).
           */
          const valueTagTooltip = this.getTooltipAttrText(label, true, true);

          /** markup in the label would otherwise land in the accessible name; a double
           *  quote in it would break out of the attribute entirely */
          let ariaLabelClearBtnTxt = '';
          if (this.ariaLabelTagClearButtonText) {
            const stripHtmlLabel = Utils.getAriaLabelText(label);
            const clearButtonText = Utils.getAriaLabelText(this.ariaLabelTagClearButtonText);
            ariaLabelClearBtnTxt = `aria-label="${stripHtmlLabel}, ${clearButtonText}"`;
          }

          const valueTagHtml = `<span class="vscomp-value-tag" data-index="${d.index}">
                  <span class="vscomp-value-tag-content" ${valueTagTooltip}>${label}</span>
                  <span 
                    class="vscomp-value-tag-clear-button" 
                    role="button" 
                    ${ariaLabelClearBtnTxt}
                    tabindex="0">
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

    if (!showValueAsTags) {
      DomUtils.setData($valueText, 'tooltip', tooltipText);
    }

    if (multiple) {
      if (!showValueAsTags) {
        DomUtils.setData($valueText, 'tooltipEllipsisOnly', selectedLength === 0);
      } else {
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

    DomUtils.setAttr(this.$searchClear, 'tabindex', value !== '' ? '0' : '-1');
    DomUtils.setAria(this.$searchClear, 'hidden', value === '');

    this.afterSetSearchValue();
  }

  setVisibleOptionsCount() {
    let visibleOptionsCount = 0;
    let hasExactOption = false;
    let visibleOptionGroupsMapping;
    const { searchGroup, showOptionsOnlyOnSearch, searchByStartsWith } = this;

    /** If searchNormalize we'll normalize the searchValue */
    let { searchValue } = this;
    searchValue = this.searchNormalize && searchValue.trim() !== ''
      ? Utils.normalizeString(searchValue)
      : searchValue;
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
    /**
     * Number of options matching the current filter. Kept separately because
     * setVisibleOptions() overwrites visibleOptionsCount with the size of the rendered
     * virtualisation window, which is not what a "N results available" message means.
     */
    this.filteredOptionsCount = visibleOptionsCount;
    /** isVisible changed for the whole set, so positions and setsize must be recomputed */
    this.ariaMetadataDirty = true;

    this.afterSetVisibleOptionsCount();
  }

  /**
   * Calculates ARIA metadata (aria-setsize and aria-posinset) for virtualized listbox accessibility.
   * This method iterates through ALL filtered options (not just rendered ones) to calculate
   * the correct position in the full filtered set. This ensures screen readers announce
   * correct positions even when only a subset of options is rendered (e.g., "Option 50, 50 of 10001").
   *
   * Example: With 10,001 filtered options showing only 5 at a time:
   * - All 10,001 options get filteredIndex values: 1, 2, 3, ..., 10001
   * - ariaSetSize = 10001
   * - When options 50-54 are rendered, they have filteredIndex: 50, 51, 52, 53, 54
   * - Screen reader announces: "Option 50, 50 of 10001"
   */
  calculateAriaMetadata() {
    let ariaSetSize = 0;
    let filteredPosition = 0;
    const optionsSource = this.sortedOptions && this.sortedOptions.length ? this.sortedOptions : this.options;

    // Iterate through ALL options (not just rendered ones) to calculate positions in the full filtered set
    optionsSource.forEach((d) => {
      if (d.isCurrentNew) {
        // eslint-disable-next-line no-param-reassign
        d.filteredIndex = undefined;
        return;
      }

      if (d.isVisible === true) {
        const isSelectableGroupTitle = d.isGroupTitle && this.multiple && !this.disableOptionGroupCheckbox;
        if (!d.isGroupTitle || isSelectableGroupTitle) {
          filteredPosition += 1;
          ariaSetSize += 1;
          // eslint-disable-next-line no-param-reassign
          d.filteredIndex = filteredPosition;
        } else {
          // eslint-disable-next-line no-param-reassign
          d.filteredIndex = undefined;
        }
      } else {
        // eslint-disable-next-line no-param-reassign
        d.filteredIndex = undefined;
      }
    });

    if (this.allowNewOption) {
      const newOption = this.getNewOption();
      if (newOption && newOption.isVisible === true) {
        filteredPosition += 1;
        ariaSetSize += 1;
        newOption.filteredIndex = filteredPosition;
      } else if (newOption) {
        newOption.filteredIndex = undefined;
      }
    }

    this.ariaSetSize = ariaSetSize;
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

    /** adds a row to the filtered set */
    this.ariaMetadataDirty = true;

    const newOption = this.getNewOption();

    if (newOption) {
      const newIndex = newOption.index;

      /** value verbatim, label escaped - the label is the only one rendered as HTML */
      this.setOptionProp(newIndex, 'value', value);
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
    const valuesMapping = Object.create(null);

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
    const availableValuesMapping = Object.create(null);

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

    const valuesMapping = Object.create(null);
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
      value = this.useGroupValue ? this.getGroupValue() : this.selectedValues;
    } else {
      value = this.selectedValues[0] || '';
    }

    return Utils.normalizeValues(value);
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
    /** quotes are escaped unconditionally by getAttributesText(); escaping again here would
     *  leave a literal &quot; in the tooltip, and the old containsHTML() condition is what
     *  let a tag-free payload through in the first place */
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
    /** value stored verbatim, search keys derived from the raw text - see setOptions() */
    const rawValue = getString(data.value);
    const rawLabel = getString(data.label);
    const rawDescription = getString(data.description);

    return {
      index: data.index,
      value: rawValue,
      valueNormalized: rawValue.toLowerCase(),
      label: secureText(rawLabel),
      labelNormalized: this.searchNormalize && rawLabel.trim() !== ''
        ? Utils.normalizeString(rawLabel).toLowerCase()
        : rawLabel.toLowerCase(),
      description: secureText(rawDescription),
      descriptionNormalized: this.searchNormalize && rawDescription.trim() !== ''
        ? Utils.normalizeString(rawDescription).toLowerCase()
        : rawDescription.toLowerCase(),
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
    const valuesMapping = Object.create(null);

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
      const valuesOrder = Object.create(null);

      selectedValues.forEach((d, i) => {
        valuesOrder[d] = i;
      });

      selectedOptions.sort((a, b) => valuesOrder[a.value] - valuesOrder[b.value]);
    }

    return this.multiple || fullDetails ? selectedOptions : selectedOptions[0];
  }

  getDisabledOptions() {
    const { valueKey, labelKey, disabledOptions } = this;
    const disabledOptionsValueMapping = Object.create(null);
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
      result = parseInt(count, 10);
    }

    return result;
  }

  getOptionsHeight() {
    return `${this.optionsCount * this.optionHeight}px`;
  }

  isSelectableGroupTitle($ele) {
    return $ele && DomUtils.hasClass($ele, 'group-title') && this.multiple && !this.disableOptionGroupCheckbox;
  }

  shouldSkipOptionInNavigation($ele) {
    if (!$ele) {
      return false;
    }

    if (DomUtils.hasClass($ele, 'disabled')) {
      return true;
    }

    return DomUtils.hasClass($ele, 'group-title') && !this.isSelectableGroupTitle($ele);
  }

  /** getting next/prev valid option element */
  getSibling($ele, direction) {
    const propName = direction === 'next' ? 'nextElementSibling' : 'previousElementSibling';
    let $sibling = $ele;

    do {
      if ($sibling) {
        $sibling = $sibling[propName];
      }
    } while (this.shouldSkipOptionInNavigation($sibling));

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
      showDuration: this.showDuration,
      hideDuration: this.hideDuration,
      afterShow: this.afterShowPopper.bind(this),
      afterHide: this.afterHidePopper.bind(this),
    };

    this.dropboxPopover = new PopoverComponent(data);
  }

  openDropbox(isSilent) {
    // Set this instance as the last interacted one immediately
    VirtualSelect.lastInteractedInstance = this;
    let originalTransition = '';
    // Disable transitions for programmatic opening
    if (!isSilent) {
      // Store original transition
      originalTransition = this.$dropboxContainer.style.transition;
      this.$dropboxContainer.style.transition = 'none';
    }
    // Perform the open operation
    this.isSilentOpen = isSilent;

    // Close all other open instances first
    VirtualSelect.openInstances.forEach((instance) => {
      if (instance !== this) {
        // Don't focus when closing due to another dropdown being opened
        const instanceObj = instance;
        instanceObj.shouldFocusWrapperOnClose = false;
        instanceObj.closeDropbox(true); // silent close
      }
    });

    // Add to open instances
    VirtualSelect.openInstances.add(this);

    /**
     * The silence a close imposed (see closeDropbox) must not outlive the closed state:
     * from now on the list is visible, so a fetch that fires or resolves against this open
     * dropdown describes what the user is looking at and has to be announced - including a
     * host push refreshing the options, and the close-time reset when it lands only after
     * the user has already reopened.
     */
    this.isSilentServerSearch = false;

    /** a reopen during a still-running hide transition puts the pointer back in charge */
    this.isClosingTransition = false;

    DomUtils.setAttr(this.$dropboxWrapper, 'tabindex', '0');
    DomUtils.setAria(this.$dropboxWrapper, 'hidden', false);

    DomUtils.setAttr(this.$dropboxContainerTop, 'tabindex', '0');
    DomUtils.setAria(this.$dropboxContainerTop, 'hidden', false);

    DomUtils.setAttr(this.$dropboxContainerBottom, 'tabindex', '0');
    DomUtils.setAria(this.$dropboxContainerBottom, 'hidden', false);

    if (isSilent) {
      DomUtils.setStyle(this.$dropboxContainer, 'display', 'inline-flex');
    } else {
      DomUtils.dispatchEvent(this.$ele, 'beforeOpen');
      /**
       * The wrapper is the one combobox and the one carrier of aria-expanded. The search
       * input deliberately is not a second combobox: nesting one combobox inside another is
       * a structure screen readers disagree on, and aria-expanded is not a supported state
       * of the input's implicit textbox role - which does support the wiring the input
       * needs (aria-autocomplete, aria-controls, aria-activedescendant).
       */
      DomUtils.setAria(this.$wrapper, 'expanded', true);
    }

    this.setDropboxWrapperWidth();
    DomUtils.removeClass(this.$allWrappers, 'closed');
    DomUtils.changeTabIndex(this.$allWrappers, 0);

    if (!isSilent) {
      // INTENTIONAL forced reflow (do not remove as a "no-op"): reading offsetHeight flushes
      // the 'transition: none' set above so restoring the transition below does not animate the
      // open from a stale layout. Scoped to a single element on open, so the cost is negligible.
      this.$dropboxContainer.offsetHeight; // eslint-disable-line no-unused-expressions
      // Restore transitions immediately after reflow
      this.$dropboxContainer.style.transition = originalTransition;
    }

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
        this.focusElementOnOpen();
      }

      DomUtils.dispatchEvent(this.$ele, 'afterOpen');
    }
  }

  closeDropbox(isSilent) {
    this.isSilentClose = isSilent;

    // Remove from open instances
    VirtualSelect.openInstances.delete(this);

    if (this.isOpened() === false) {
      return;
    }

    if (this.keepAlwaysOpen) {
      this.removeOptionFocus();
      return;
    }

    // Return focus to wrapper only when no other meaningful element currently has focus
    const active = document.activeElement;
    const withinComponent = (active && this.$wrapper.contains(active)) || this.isFocusInsideDropbox(active);

    const shouldRefocus = this.shouldFocusWrapperOnClose &&
      VirtualSelect.lastInteractedInstance === this &&
      !isSilent &&
      (active === null || active === document.body || withinComponent);

    if (shouldRefocus) {
      this.$wrapper.focus();
    }

    if (isSilent) {
      DomUtils.setStyle(this.$dropboxContainer, 'display', '');
    } else {
      DomUtils.dispatchEvent(this.$ele, 'beforeClose');
      DomUtils.setAria(this.$wrapper, 'expanded', false);
      /**
       * No option is active once the list is gone - and the highlight has to go with it,
       * here, synchronously.
       *
       * afterHidePopper() already calls removeOptionFocus(), but for popover-backed
       * instances it only runs when the hide transition ends (~200ms later). Until then the
       * previous highlight and `focusedOptionIndex` survived the close, so reopening within
       * that window resumed navigation from the old position instead of the first option:
       * the next Up/Down moved one step past where the user expected, which on a grouped
       * multi-select meant Enter landed on the first child option instead of toggling the
       * group title. removeOptionFocus() is a no-op when nothing is highlighted, so leaving
       * the afterHidePopper() call in place costs nothing and still covers the silent path.
       */
      this.removeOptionFocus();
      this.setActiveDescendant('');
    }

    /**
     * Taking the dropbox out of the tab order happens here, but hiding it from assistive
     * technology is left to afterHidePopper() - where the rest of the closed state lands, the
     * `closed` class and with it the `display: none` that actually takes the dropbox off the
     * screen.
     *
     * aria-hidden used to be set here too, so for the ~200ms of the popover's hide transition
     * the dropbox was marked absent while still visible, still hit-testable and still
     * `isOpened() === true`. Every handler gated on isOpened() therefore kept running against a
     * subtree already declared hidden - and onOptionsMouseOver() -> focusOption() moves DOM
     * focus onto the option it highlights. Chrome refuses to apply aria-hidden over the focused
     * element ("Blocked aria-hidden on an element because its descendant retained focus"), so
     * the dropbox stayed exposed anyway: the component and the accessibility tree disagreed,
     * and a screen reader follows the tree. Selecting an option in a single select was enough
     * to hit it - the pointer is still over the list while it fades out.
     *
     * isClosingTransition covers the transition itself: without it the pointer kept driving
     * the fading list - re-highlighting options, re-writing the aria-activedescendant this
     * close just cleared onto a combobox already announcing itself collapsed, and pulling DOM
     * focus back in. What the pointer gate cannot stop (a host focusing into the dropbox, or
     * highlight paths it drives programmatically), releaseFocusFromDropbox() releases at
     * hide-end, before the attribute lands. For those 200ms the list genuinely is still on
     * screen, so exposing it to AT until it leaves matches what a sighted user sees. tabindex
     * stays here because it was never part of the conflict - it does not block a programmatic
     * focus() - and moving it would change when the dropbox leaves the tab order.
     */
    if (this.dropboxPopover && !isSilent) {
      this.isClosingTransition = true;
      this.dropboxPopover.hide();

      DomUtils.setAttr(this.$dropboxWrapper, 'tabindex', '-1');
      DomUtils.setAttr(this.$dropboxContainerTop, 'tabindex', '-1');
      DomUtils.setAttr(this.$dropboxContainerBottom, 'tabindex', '-1');
    } else {
      this.afterHidePopper();
    }

    /**
     * Clearing the filter runs afterSetSearchValue(), which highlights the first visible
     * option again. That undid the removeOptionFocus() above whenever the user had typed
     * something: the highlight and aria-activedescendant came straight back on a combobox
     * already marked aria-expanded="false", and focusOption() pulled DOM focus onto an option
     * that is about to be display:none - so the keyboard position ended up on <body>.
     *
     * isClosing is scoped to this one call rather than the whole method because everything
     * above it (the wrapper refocus in particular) still needs the real state. The reset runs
     * in a finally: if setSearchValue() ever threw, a stuck flag would silently stop the
     * highlight coming back after *every* later filter clear, which is far harder to diagnose
     * than the exception itself.
     */
    this.isClosing = true;

    try {
      this.setSearchValue('');
    } finally {
      this.isClosing = false;
    }

    /**
     * From here until the next open, no server-search announcement may reach the live region:
     * the dropdown the messages would describe is gone. Closing spoke twice for an interaction
     * the user never made - the reset above schedules a fetch of its own, which said
     * loadingText one searchDelay after the dropbox had closed and then the result count when
     * the host responded. The local path already refuses to announce a reset it performed
     * itself (announceSearchResults); this flag is the same rule for the server path.
     *
     * A flag set for the whole closed period, rather than one latched onto the scheduled
     * fetch, because the close cannot see everything that is still going to speak:
     * setSearchValue('') early-returns when the user already emptied the box (leaving *their*
     * pending fetch to fire after the close), and a response to an earlier search can land
     * mid hide-transition, while isOpened() is still true. openDropbox() lifts the silence,
     * so it cannot leak into the next open either.
     *
     * The reset fetch itself is deliberately left running - it is what restores the
     * unfiltered list for the next open, since opening does not search.
     */
    if (this.hasServerSearch) {
      this.isSilentServerSearch = true;
    }
  }

  afterHidePopper() {
    const isSilent = this.isSilentClose;
    this.isSilentClose = false;
    this.isClosingTransition = false;

    DomUtils.removeClass(this.$allWrappers, 'focused');
    this.removeOptionFocus();

    if (!isSilent && this.isPopupActive) {
      DomUtils.removeClass(this.$body, 'vscomp-popup-active');
      this.isPopupActive = false;
    }

    DomUtils.addClass(this.$allWrappers, 'closed');

    /**
     * After the closed class, so a focus handler reacting to the wrapper refocus observes a
     * dropdown that is really closed, and before the aria-hidden writes below - nothing may
     * hold focus inside the subtree when that attribute lands, or Chrome refuses it and the
     * dropbox stays exposed to AT. Within this synchronous block the browser has not yet
     * recalculated style, so document.activeElement still reports the element inside the
     * dropbox even though the closed class will eventually drop focus to <body> - which is
     * exactly the focus loss the release turns into a deliberate hand-back.
     *
     * (afterClose needs no such ordering care: DomUtils.dispatchEvent() defers events through
     * setTimeout(0), so a consumer's afterClose handler always runs after this method has
     * finished.)
     */
    this.releaseFocusFromDropbox();

    if (!isSilent) {
      DomUtils.dispatchEvent(this.$ele, 'afterClose');
    }

    // Reset for next close
    this.shouldFocusWrapperOnClose = true;

    /**
     * Stand down if a focus handler above reopened the dropdown synchronously: openDropbox()
     * has already made the dropbox visible and focusable again, and hiding it now would leave
     * it on screen but absent from the accessibility tree. The next close re-applies these
     * through its own afterHidePopper().
     *
     * Deliberately isOpened() and not `VirtualSelect.openInstances.has(this)`, even though the
     * latter also means "reopened". The two differ for a hide that lost a race with an earlier
     * reopen - `open()` called during the fade, which does not cancel the popover's pending
     * hide because its show() early-returns while `pop-comp-active` is still set. That hide
     * has to *complete*: the popover has already taken the dropbox off the screen by the time
     * it calls back, so standing down would leave the wrapper without its `closed` class,
     * `isOpened()` true against an invisible dropbox, and every later toggle closing a
     * dropdown that is not there - unreopenable. Verified by building it: the openInstances
     * form fails the recovery assertions in a11y-aria-hidden-focus.cy.ts.
     *
     * isOpened() is false here for that stale case (addClass above set it) and true only for
     * the synchronous reopen this guard is for, which is exactly the split that is wanted.
     */
    if (this.isOpened()) {
      return;
    }

    DomUtils.setAttr(this.$dropboxWrapper, 'tabindex', '-1');
    DomUtils.setAria(this.$dropboxWrapper, 'hidden', true);

    DomUtils.setAttr(this.$dropboxContainerTop, 'tabindex', '-1');
    DomUtils.setAria(this.$dropboxContainerTop, 'hidden', true);

    DomUtils.setAttr(this.$dropboxContainerBottom, 'tabindex', '-1');
    DomUtils.setAria(this.$dropboxContainerBottom, 'hidden', true);
  }

  moveSelectedOptionsFirst() {
    if (!this.$optionsContainer.scrollTop || !this.selectedValues.length) {
      this.setVisibleOptions();
    }

    if (!this.showSelectedOptionsFirst) {
      return;
    }

    this.setSortedOptions();
    this.scrollToTop();
    this.setVisibleOptions();
  }

  toggleDropbox() {
    VirtualSelect.lastInteractedInstance = this;
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

  focusElementOnOpen() {
    const $ele = this.$searchInput;
    const hasNoOptions = !this.options.length && !this.hasServerSearch;

    if ($ele) {
      if (hasNoOptions && !this.allowNewOption) {
        DomUtils.setAttr($ele, 'disabled', '');
        this.$noOptions.focus();
      } else {
        $ele.removeAttribute('disabled');
        $ele.focus();
      }
    } else {
      const $focusableEle = this.$dropbox.querySelector('[tabindex="0"]');
      const optIndex = DomUtils.getData($focusableEle, 'index');

      if (optIndex !== undefined) {
        this.focusOption({ direction: 'next' });
      } else if ($focusableEle) {
        $focusableEle.focus();
      } else {
        this.focusFirstVisibleOption();
      }
    }
  }

  focusFirstVisibleOption() {
    let $focusableEle = this.$optionsContainer.querySelector(`[data-index='${this.getFirstVisibleOptionIndex()}']`);

    if ($focusableEle) {
      if (this.shouldSkipOptionInNavigation($focusableEle)) {
        $focusableEle = this.getSibling($focusableEle, 'next');
      }

      if ($focusableEle) {
        DomUtils.setAttr($focusableEle, 'tabindex', '0');
        this.$optionsContainer.scrollTop = this.optionHeight * this.getFirstVisibleOptionIndex();
        this.focusOption({
          focusFirst: true,
        });
        $focusableEle.focus();
      }
    } else {
      $focusableEle = this.$dropbox.querySelector('[tabindex="0"]');
      if ($focusableEle) {
        $focusableEle.focus();
      }
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

      if (this.shouldSkipOptionInNavigation($newFocusedEle)) {
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

  /**
   * Whether the node is inside the dropbox proper - the subtree that is hidden on close.
   *
   * The portalled wrapper when there is one (`dropboxWrapper` option): it is the element that
   * carries aria-hidden and everything in it goes away on close. The container otherwise: it
   * lives inside $wrapper, whose toggle button and value display survive a close, so testing
   * against $wrapper here would wrongly treat "focus on the combobox itself" as focus that
   * needs releasing.
   *
   * Deliberately narrower than closeDropbox()'s within-component test (which also counts the
   * combobox, to decide whether the user's focus deserves restoring), and different again from
   * the Escape containment in onKeyDown() (which resolves the element hosting the keydown
   * listener). The three answer different questions and are not interchangeable.
   *
   * @param {Element | null} $node
   * @returns {boolean}
   */
  isFocusInsideDropbox($node) {
    const $root = this.$dropboxWrapper || this.$dropboxContainer;

    return !!$node && $root.contains($node);
  }

  /**
   * Take DOM focus out of the dropbox at the moment it is actually hidden.
   *
   * closeDropbox()'s own refocus runs when the close is *requested*; during the hide
   * transition focus can re-enter the dropbox (a host focusing into it, or any host-driven
   * path ending in focusOption(), which focuses the option it highlights). This runs from
   * afterHidePopper(), immediately before the subtree is marked aria-hidden, and hands focus
   * back to the combobox (WCAG 2.4.3 Focus Order) - re-asserting the decision the close-time
   * refocus already made before something mid-fade overrode it. Without it, the closed
   * class's display:none silently drops that focus to <body>.
   *
   * Two deliberate divergences from closeDropbox()'s refocus guards:
   * - no lastInteractedInstance / isSilent conditions: by hide-end those describe the close
   *   that *started* the transition, not where focus is now. The only question left is "is
   *   focus about to be trapped inside a hidden subtree" - if it is, it cannot stay there,
   *   whoever caused the close.
   * - shouldFocusWrapperOnClose decides *where* focus goes, not *whether* it moves: when the
   *   close was caused by focus moving elsewhere (another dropdown opening, an outside
   *   click), the element is only blurred, so this instance does not steal focus from
   *   wherever it now belongs.
   *
   * No "has this instance been reopened" guard, deliberately. It reads as the safe thing to
   * add - a stale hide should not yank focus out of a dropdown the user is looking at - but a
   * reopen that genuinely put the dropbox back on screen cannot have a hide still pending
   * against it: the popover clears `pop-comp-active` before calling back, so a successful
   * show() means the hide already finished. What such a guard actually suppresses is the one
   * case that needs the release most - the reopen that lost its race with the fade, where the
   * popover has already applied display:none and focus inside the dropbox is about to be lost
   * to <body>. The caller decides whether the dropbox is being hidden; this only makes sure
   * nothing is focused inside it when that happens.
   *
   * preventScroll because this runs ~200ms after the user's action - if they have scrolled in
   * the meantime, focus restoration must not scroll the combobox back into view (the
   * deferred re-focus in afterRenderOptions() makes the same call).
   */
  releaseFocusFromDropbox() {
    const $active = document.activeElement;

    if (!this.isFocusInsideDropbox($active)) {
      return;
    }

    if (this.shouldFocusWrapperOnClose) {
      this.$wrapper.focus({ preventScroll: true });
    } else {
      $active.blur();
    }
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
      this.beforeSelectNewValue(selectedValue);
    }

    this.setValue(selectedValues);

    if (shouldSelectRange) {
      this.selectRangeOptions(lastSelectedOptionIndex, selectedIndex);
    }
  }

  selectFocusedOption() {
    const $focusedEle = this.$dropboxContainer.querySelector('.vscomp-option.focused');

    if (!$focusedEle) {
      return;
    }

    if (this.isSelectableGroupTitle($focusedEle)) {
      this.onGroupTitleClick($focusedEle);
      return;
    }

    this.selectOption($focusedEle);
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
        toggleGroupTitleProp(parseInt(i, 10));
      });
    }

    /** using setTimeout to fix the issue of dropbox getting closed on select */
    this.setManagedTimeout(() => {
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

    /** When all options not selected, checking if all visible options selected
     *  Also, in a search mode, validate that we still have visible items
    */
    if (!isAllSelected && this.selectAllOnlyVisible &&
      (this.searchValue !== '' && (this.visibleOptionsCount > 0 || this.searchValue === ''))) {
      isAllVisibleSelected = this.isAllOptionsSelected(true);
    }

    const isChecked = isAllSelected || isAllVisibleSelected;

    DomUtils.toggleClass(this.$toggleAllCheckbox, 'checked', isChecked);
    /**
     * Mirror the visual checked state onto the role="checkbox" host. This is the single
     * point every selection path funnels through (select all, deselect all, per-option
     * clicks, group toggles, setValue, reset), so the exposed state cannot drift.
     */
    DomUtils.setAria(this.$toggleAllButton, 'checked', isChecked);

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
      groupIndex = parseInt(groupIndex, 10);
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
    const valuesMapping = Object.create(null);
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
    this.setManagedTimeout(() => {
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
    /**
     * Explicitly against null, not truthiness. focusedOptionIndex comes from
     * DomUtils.getData($ele, 'index') with no type, so today it is the *string* "0" and a
     * truthiness test happens to pass for the first option. Normalise it to a number anywhere
     * and index 0 would stop being cleared, so its `isFocused` prop would survive - and
     * renderOptions() re-applies `.focused` and tabindex="0" from that prop, bringing the
     * stale highlight back through the data path on the next render.
     */
    if (this.focusedOptionIndex !== null && this.focusedOptionIndex !== undefined) {
      this.setOptionProp(this.focusedOptionIndex, 'isFocused', false);
    }

    this.setOptionProp(index, 'isFocused', isFocused);
    this.focusedOptionIndex = index;
  }

  toggleSelectedProp(index, isSelected = false) {
    this.setOptionProp(index, 'isSelected', isSelected);
  }

  scrollToTop() {
    const { scrollTop } = this.$optionsContainer;

    if (scrollTop > 0) {
      this.$optionsContainer.scrollTop = 0;
    }
  }

  reset(formReset = false, disableChangeEvent = false) {
    this.options.forEach((d) => {
      // eslint-disable-next-line no-param-reassign
      d.isSelected = false;
    });

    this.beforeValueSet(true);
    this.setValue(null, { disableEvent: disableChangeEvent, disableValidation: formReset });
    this.afterValueSet();

    if (formReset) {
      /**
       * A native form reset clears the error state, not just the colour that showed it.
       *
       * Removing `has-error` alone left aria-invalid="true" on the combobox and
       * aria-describedby pointing at an error element that still held its text - so the control
       * stayed announced as invalid, describing a message the user could no longer see, with no
       * interaction able to clear it. setErrorMessage('') empties the text and drops
       * aria-describedby, and does not announce (it only announces a non-empty message).
       */
      DomUtils.removeClass(this.$allWrappers, 'has-error');
      DomUtils.toggleAria(this.$allWrappers, 'invalid', false);
      this.setErrorMessage('');
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
      /** removes a row from the filtered set */
      this.ariaMetadataDirty = true;
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
    const value = data.valueNormalized != null
      ? data.valueNormalized
      : data.value.toLowerCase();
    let label = data.labelNormalized;

    if (label == null) {
      const rawLabel = (data.label || '').trim();

      if (this.searchNormalize && rawLabel !== '') {
        label = Utils.normalizeString(rawLabel).toLowerCase();
      } else {
        label = rawLabel.toLowerCase();
      }
    }

    const { description, alias } = data;
    let { descriptionNormalized } = data;

    if (descriptionNormalized == null) {
      const rawDescription = description || '';

      if (this.searchNormalize && rawDescription.trim() !== '') {
        descriptionNormalized = Utils.normalizeString(rawDescription).toLowerCase();
      } else {
        descriptionNormalized = rawDescription.toLowerCase();
      }
    }

    let isVisible = searchByStartsWith ? label.startsWith(searchValue) : label.includes(searchValue);

    if (data.isGroupTitle && (!searchGroup || !isVisible)) {
      isVisible = visibleOptionGroupsMapping[data.index];
    }

    if (!searchByStartsWith && alias && !isVisible) {
      isVisible = alias.includes(searchValue);
    }

    if (!searchByStartsWith && descriptionNormalized && !isVisible) {
      isVisible = descriptionNormalized.includes(searchValue);
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

    /**
     * The spinner is a visual-only cue; announce that a fetch is in flight - but only for a
     * dropdown the user can see. The silent flag covers the closed period (see closeDropbox);
     * isOpened() covers fetches the component issued on its own while closed, such as the
     * search reset showOptionsOnlyOnSearch forces during construction, which otherwise spoke
     * loadingText on a page the user had not touched yet.
     */
    if (this.isInitialized && !this.isSilentServerSearch && this.isOpened()) {
      this.announce(this.loadingText);
    }

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
    DomUtils.changeTabIndex(this.$wrapper, 0);
  }

  disable() {
    this.$ele.disabled = true;

    this.$ele.setAttribute('disabled', '');
    this.$hiddenInput.setAttribute('disabled', '');
    DomUtils.setAria(this.$wrapper, 'disabled', true);
    DomUtils.changeTabIndex(this.$wrapper, -1);
    this.$wrapper.blur();
  }

  validate() {
    if (this.disableValidation) {
      return true;
    }

    let hasError = false;
    let errorText = '';
    const { selectedValues, minValues } = this;

    if (this.required) {
      if (Utils.isEmpty(selectedValues)) {
        hasError = true;
        errorText = this.requiredErrorText;
      } else if (this.multiple && minValues && selectedValues.length < minValues) {
        /** required minium options not selected */
        hasError = true;
        errorText = Utils.getString(this.minValuesErrorText).replace('{count}', minValues);
      }
    }

    DomUtils.toggleClass(this.$allWrappers, 'has-error', hasError);

    /**
     * Previously the only signal was the `has-error` class recolouring the toggle button
     * border: invisible to assistive technology and, being colour alone, a 1.4.1 failure.
     * Expose the state (aria-invalid), give it a text message, point the combobox at that
     * message (aria-describedby) and announce it.
     */
    DomUtils.toggleAria(this.$allWrappers, 'invalid', hasError);
    this.setErrorMessage(hasError ? errorText : '');

    return !hasError;
  }

  /**
   * Show or clear the validation message and its association with the combobox.
   * An empty message removes aria-describedby rather than pointing at empty text.
   *
   * @param {string} message
   */
  setErrorMessage(message) {
    if (!this.$errorMessage) {
      return;
    }

    const text = message || '';

    this.$errorMessage.textContent = text;
    DomUtils.toggleAria(this.$allWrappers, 'describedby', !!text, this.$errorMessage.id);

    /**
     * The message is shown and exposed unconditionally, but only *announced* for something the
     * user did. A live region is for status changes they caused.
     *
     * isInitialized keeps construction quiet: the initial setValueMethod() runs before that flag
     * is set, so a page supplied with an invalid initial value used to load already speaking
     * "Select at least 2 options". isRefreshingOptions keeps a programmatic data swap quiet:
     * afterSetOptions() calls reset(), which validates, so replacing the options announced a
     * failure for a field the user had never touched.
     *
     * Both are deliberately narrow. The interactive paths - the clear button, deselecting below
     * minValues, and an explicit validate() from the application - must still announce, which is
     * the whole point of routing validation through this region.
     */
    if (text && this.isInitialized && !this.isRefreshingOptions) {
      this.announce(text);
    }
  }

  /**
   * setTimeout wrapper whose pending timers are tracked so they can be cleared on destroy().
   * Prevents callbacks from running against a destroyed instance (stale DOM access / retention).
   */
  setManagedTimeout(callback, delay) {
    if (!this.managedTimeouts) {
      this.managedTimeouts = new Set();
    }

    const id = setTimeout(() => {
      this.managedTimeouts.delete(id);
      callback();
    }, delay);

    this.managedTimeouts.add(id);

    return id;
  }

  clearManagedTimeouts() {
    if (this.managedTimeouts) {
      this.managedTimeouts.forEach((id) => clearTimeout(id));
      this.managedTimeouts.clear();
    }
  }

  destroy() {
    if (this.isDestroyed) {
      return;
    }
    this.isDestroyed = true;

    const { $ele } = this;
    $ele.virtualSelect = undefined;
    $ele.value = undefined;
    $ele.innerHTML = '';

    // Remove from open instances
    VirtualSelect.openInstances.delete(this);

    // Reset the last interacted instance only if this is the last interacted instance
    if (this === VirtualSelect.lastInteractedInstance) {
      VirtualSelect.lastInteractedInstance = null;
    }

    // Clear any pending server search timeout to prevent memory leaks
    if (this.serverSearchTimeout) {
      clearTimeout(this.serverSearchTimeout);
      this.serverSearchTimeout = null;
    }

    // Clear any other pending timeouts so their callbacks don't run on a destroyed instance
    this.clearManagedTimeouts();

    // Drop any queued scroll re-render so it cannot touch detached DOM
    if (this.scrollAnimationFrame) {
      cancelAnimationFrame(this.scrollAnimationFrame);
      this.scrollAnimationFrame = null;
    }

    /** Remove all event listeners to prevent memory leaks and ensure proper cleanup */
    this.removeEvents();

    if (this.hasDropboxWrapper) {
      /** clear the back-reference (set in setEleProps) before detaching so the
       * detached wrapper does not keep this instance and its DOM alive */
      this.$dropboxWrapper.virtualSelect = undefined;
      this.$dropboxWrapper.remove();
    }

    if (this.dropboxPopover) {
      this.dropboxPopover.destroy();
    }

    DomUtils.removeClass($ele, 'vscomp-ele');

    /** drop references to cached callbacks and DOM so nothing is retained after destroy */
    this.events = {};

    /** stop tracking this instance; tears down global listeners/observer when it was the last one */
    VirtualSelect.unregisterInstance(this);
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

    /**
     * escape potentially harmful markup so label/value/description cannot trigger XSS.
     *
     * Quotes are deliberately *not* rewritten here. They were, and the text node's innerHTML
     * then escaped the `&` that introduced - so `The "City" of Light` used to be stored as
     * `The &amp;quot;City&amp;quot; of Light`, shown to the user as `The &quot;City&quot; of
     * Light`, and made unsearchable, because labelNormalized derives from the stored text.
     * Quotes only need escaping inside an attribute, and that now happens at each attribute
     * boundary instead (data-value in renderOptions, DomUtils.getAttributesText) - which also
     * covers the sinks this pre-escaping never reached, such as an attribute written while
     * enableSecureText is off.
     */
    this.$secureText.nodeValue = text;

    return this.$secureDiv.innerHTML;
  }

  /**
   * Emit a single (per page) console warning when an instance is constructed while
   * enableSecureText is disabled. enableSecureText is OFF by default to avoid the per-option
   * escaping cost on large datasets (10k-100k+ records); this warning makes the XSS trade-off
   * discoverable without forcing that cost on everyone. O(1): it never scans option content
   * and fires on the configuration alone, so it is not missed when options are loaded later
   * (e.g. via setOptions or server search).
   */
  warnIfSecureTextDisabled() {
    if (VirtualSelect.secureTextWarningShown || this.enableSecureText || !this.showSecureTextWarning) {
      return;
    }

    VirtualSelect.secureTextWarningShown = true;

    // eslint-disable-next-line no-console
    console.warn(
      '[virtual-select] Option text (label, value, description) and any `customData` used in ' +
        'markup are rendered as HTML and are NOT escaped because `enableSecureText` is disabled ' +
        '(the default, kept off for performance on large datasets). If any option text can come ' +
        'from untrusted input, set `enableSecureText: true` to prevent XSS. ' +
        'Docs: https://sa-si-dev.github.io/virtual-select/#/properties',
    );
  }

  /**
   * Write a message into the instance's polite live region (WCAG 4.1.3 Status Messages).
   *
   * Identical consecutive messages are intentionally left alone: re-writing the same text
   * produces no DOM mutation, so assistive technology does not repeat "No results found"
   * on every further keystroke that still matches nothing.
   *
   * @param {string} message
   */
  announce(message) {
    if (!this.$liveRegion) {
      return;
    }

    /**
     * Reduced to plain text because the region is written with textContent, so whatever is put
     * there is read out literally. A single select announces the chosen label, and a label can
     * carry both escaping and markup: with enableSecureText on the region said
     * "Tom &amp; Jerry selected", and decoding alone would only have turned that into
     * "<i class="flag"></i> France selected". Neither is speech. Messages the component composes
     * itself contain no markup, so this is a no-op for them.
     */
    const text = Utils.getPlainText(message || '');

    if (this.$liveRegion.textContent !== text) {
      this.$liveRegion.textContent = text;
    }
  }

  /**
   * Message describing how many options the current filter matched.
   * @returns {string}
   */
  getResultsCountMessage() {
    const count = this.filteredOptionsCount || 0;

    if (count === 0) {
      return this.noSearchResultsText;
    }

    return `${count} ${count === 1 ? this.searchResultText : this.searchResultsText}`;
  }

  /**
   * Message describing the current selection.
   * @returns {string}
   */
  getSelectionMessage() {
    const count = this.selectedValues.length;

    if (count === 0) {
      return this.noOptionsSelectedText;
    }

    if (this.multiple) {
      return `${count} ${count === 1 ? this.optionSelectedText : this.optionsSelectedText}`;
    }

    /** option flags are updated before setValue(), so the label is already current */
    const label = this.getDisplayValue() || this.selectedValues[0];

    return `${label} ${this.selectedText}`;
  }

  /**
   * Announce the match count, but only while the user is actually searching.
   * setSearchValue('') also runs on close and after a value is set; announcing there
   * would read a stale count into the user's ear for an interaction they did not make.
   */
  announceSearchResults() {
    if (!this.isInitialized || !this.isOpened() || document.activeElement !== this.$searchInput) {
      return;
    }

    this.announce(this.getResultsCountMessage());
  }

  toggleRequired(isRequired) {
    this.required = Utils.convertToBoolean(isRequired);
    this.$ele.required = this.required;
    DomUtils.toggleAria(this.$allWrappers, 'required', this.required);

    /** dropping the requirement also drops any error it produced */
    if (!this.required) {
      DomUtils.toggleClass(this.$allWrappers, 'has-error', false);
      DomUtils.toggleAria(this.$allWrappers, 'invalid', false);
      this.setErrorMessage('');
    }
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
    DomUtils.setAttr($ele, 'tabindex', isFocused ? '0' : '-1');

    /**
     * Only *taking* the highlight moves DOM focus. Clearing it used to focus the element it
     * had just un-highlighted, which is either pointless (focusOption immediately focuses the
     * new option anyway) or actively wrong: on close it pulled focus into a dropbox that is
     * about to be hidden, fighting the wrapper refocus in closeDropbox().
     */
    if (isFocused && document.activeElement !== this.$searchInput) {
      $ele.focus();
    }

    /**
     * Publish the highlight on the elements that can carry it: the wrapper (the combobox)
     * and the search input (a textbox, which also supports aria-activedescendant). It used
     * to also go on $dropboxContainer, a plain div with no role, where aria-activedescendant
     * is meaningless - and never on the search input, which is the element that actually
     * holds focus while navigating.
     */
    this.setActiveDescendant(isFocused ? $ele.id : '');
  }

  /**
   * Point the combobox wrapper and the search input at the active option, or clear the
   * reference.
   * @param {string} optionId
   */
  setActiveDescendant(optionId) {
    DomUtils.toggleAria(this.$wrapper, 'activedescendant', !!optionId, optionId);
    DomUtils.toggleAria(this.$searchInput, 'activedescendant', !!optionId, optionId);
  }

  /** static methods - start */

  /**
   * Set page-level default props applied to every instance created afterwards.
   *
   * The motivating case is security: option text is interpolated into innerHTML and is only
   * escaped when `enableSecureText` is on, which it is not by default (escaping costs per
   * option, and large trusted lists should not pay for it). A host that does render
   * untrusted option text can turn escaping on once here rather than at every call site:
   *
   *   VirtualSelect.setGlobalDefaults({ enableSecureText: true });
   *
   * These are defaults, not overrides: an instance passing the prop explicitly still wins,
   * so a host forwarding `enableSecureText` on every init must stop doing so (or forward
   * `true`) for this to take effect. Calls merge, so features can be configured separately.
   * Only instances created after the call are affected.
   *
   * @param {Partial<virtualSelectOptions>} props
   */
  static setGlobalDefaults(props) {
    /**
     * A non-object is ignored, not treated as "clear": a host forwarding an accidentally
     * unset config variable would otherwise silently turn a page-wide security policy off.
     * Clearing is an explicit act - resetGlobalDefaults(). A key can still be cleared
     * individually by passing it with the value `undefined`, which setDefaultProps()
     * treats as "not supplied".
     */
    if (!props || typeof props !== 'object') {
      return;
    }

    /** `ele` and `options` are per-instance by nature and would alias state across instances */
    const safeProps = { ...props };
    delete safeProps.ele;
    delete safeProps.options;

    VirtualSelect.globalDefaults = { ...VirtualSelect.globalDefaults, ...safeProps };
  }

  /**
   * Drop every page-level default, restoring the built-in ones for instances created
   * afterwards. The explicit counterpart to setGlobalDefaults(), which only ever merges.
   */
  static resetGlobalDefaults() {
    VirtualSelect.globalDefaults = {};
  }

  /**
   * Currently active page-level defaults.
   * A copy, so callers cannot mutate the live object.
   *
   * @returns {Partial<virtualSelectOptions>}
   */
  static getGlobalDefaults() {
    return { ...VirtualSelect.globalDefaults };
  }

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

  static reset(formReset = false, disableChangeEvent = false) {
    this.virtualSelect.reset(formReset, disableChangeEvent);
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

  // Stable reference to the throttled resize handler is assigned at module init time
  // (see `VirtualSelect.onResizeThrottled = ...`). The resize/reset/submit listeners are
  // attached lazily in addGlobalListeners() on the first instance, not at module scope.

  static onResizeMethod() {
    document.querySelectorAll('.vscomp-ele-wrapper').forEach(($ele) => {
      /** guard against wrappers whose instance is mid-teardown / not initialised */
      const instance = $ele.parentElement && $ele.parentElement.virtualSelect;

      if (instance) {
        instance.onResize();
      }
    });
  }
  /** static methods - end */
}

/**
 * throttle resize so the per-instance height recompute runs at most ~10x/sec during a drag.
 * Keep a stable reference on VirtualSelect so add/removeGlobalListeners can attach and detach
 * the exact same handler. The page-level resize/reset/submit listeners are attached lazily on
 * the first instance (registerInstance) and removed when the last instance is destroyed
 * (unregisterInstance), so nothing global lingers when no dropdown exists.
 */
VirtualSelect.onResizeThrottled = Utils.throttle(VirtualSelect.onResizeMethod, 100);

attrPropsMapping = VirtualSelect.getAttrProps();
window.VirtualSelect = VirtualSelect;

// Static property for tracking open dropdowns
VirtualSelect.openInstances = new Set();

// Single shared MutationObserver that self-destroys instances whose host element is removed
VirtualSelect.domObserver = null;

// Set of live instances; drives lazy setup/teardown of the shared observer and page listeners
VirtualSelect.activeInstances = new Set();

// Whether the page-level resize/reset/submit listeners are currently attached
VirtualSelect.hasGlobalListeners = false;

// Static property for tracking the last interacted instance
VirtualSelect.lastInteractedInstance = null;

// Ensures the "enableSecureText disabled" warning is logged at most once per page
VirtualSelect.secureTextWarningShown = false;

// Page-level default props, applied under per-instance options (see setGlobalDefaults)
VirtualSelect.globalDefaults = {};

/** polyfill to fix an issue in ie browser */
if (typeof NodeList !== 'undefined' && NodeList.prototype && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
