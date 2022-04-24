/*!
 * Virtual Select v1.0.29
 * https://sa-si-dev.github.io/virtual-select
 * Licensed under MIT (https://github.com/sa-si-dev/virtual-select/blob/master/LICENSE)
 *//******/ (function() { // webpackBootstrap
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";

// UNUSED EXPORTS: VirtualSelect

;// CONCATENATED MODULE: ./src/utils/utils.js
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var Utils = /*#__PURE__*/function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  _createClass(Utils, null, [{
    key: "getString",
    value:
    /**
     * @param {any} text
     * @returns {string}
     */
    function getString(text) {
      return text || text === 0 ? text.toString() : '';
    }
    /**
     * @param {any} value
     * @param {boolean} defaultValue
     * @returns {boolean}
     */

  }, {
    key: "convertToBoolean",
    value: function convertToBoolean(value) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var result;

      if (value === true || value === 'true') {
        result = true;
      } else if (value === false || value === 'false') {
        result = false;
      } else {
        result = defaultValue;
      }

      return result;
    }
    /**
     * @param {any} value
     * @returns {boolean}
     */

  }, {
    key: "isEmpty",
    value: function isEmpty(value) {
      var result = false;

      if (!value) {
        result = true;
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          result = true;
        }
      } else if (_typeof(value) === 'object') {
        if (Object.keys(value).length === 0) {
          result = true;
        }
      }

      return result;
    }
    /**
     * @param {any} value
     * @returns {boolean}
     */

  }, {
    key: "isNotEmpty",
    value: function isNotEmpty(value) {
      return !this.isEmpty(value);
    }
    /**
     * @param {any[]} array
     * @param {any} value
     * @param {boolean} cloneArray
     * @returns {any[]}
     */

  }, {
    key: "removeItemFromArray",
    value: function removeItemFromArray(array, value) {
      var cloneArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (!Array.isArray(array) || !array.length) {
        return array;
      }

      var inputArr = cloneArray ? _toConsumableArray(array) : array;
      var index = inputArr.indexOf(value);

      if (index !== -1) {
        inputArr.splice(index, 1);
      }

      return inputArr;
    }
    /**
     * @param {any[]} array
     * @returns {any[]}
     */

  }, {
    key: "removeArrayEmpty",
    value: function removeArrayEmpty(array) {
      if (!Array.isArray(array) || !array.length) {
        return [];
      }

      return array.filter(function (d) {
        return !!d;
      });
    }
    /**
     * @param {number} max
     * @param {number} max
     * @returns {number}
     */

  }, {
    key: "getRandomInt",
    value: function getRandomInt(max) {
      var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var minN = Math.ceil(min);
      var maxN = Math.floor(max);
      return Math.floor(Math.random() * (maxN - minN - 1)) + minN;
    }
  }]);

  return Utils;
}();
;// CONCATENATED MODULE: ./src/utils/dom-utils.js
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || dom_utils_unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function dom_utils_toConsumableArray(arr) { return dom_utils_arrayWithoutHoles(arr) || dom_utils_iterableToArray(arr) || dom_utils_unsupportedIterableToArray(arr) || dom_utils_nonIterableSpread(); }

function dom_utils_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function dom_utils_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return dom_utils_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return dom_utils_arrayLikeToArray(o, minLen); }

function dom_utils_iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function dom_utils_arrayWithoutHoles(arr) { if (Array.isArray(arr)) return dom_utils_arrayLikeToArray(arr); }

function dom_utils_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function dom_utils_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function dom_utils_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function dom_utils_createClass(Constructor, protoProps, staticProps) { if (protoProps) dom_utils_defineProperties(Constructor.prototype, protoProps); if (staticProps) dom_utils_defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }


var DomUtils = /*#__PURE__*/function () {
  function DomUtils() {
    dom_utils_classCallCheck(this, DomUtils);
  }

  dom_utils_createClass(DomUtils, null, [{
    key: "addClass",
    value:
    /**
     * @param {HTMLElement | NodeListOf<HTMLElement>} $ele
     * @param {string} classNames
     */
    function addClass($ele, classNames) {
      if (!$ele) {
        return;
      }

      var classNamesArr = classNames.split(' ');
      DomUtils.getElements($ele).forEach(function ($this) {
        var _$this$classList;

        (_$this$classList = $this.classList).add.apply(_$this$classList, dom_utils_toConsumableArray(classNamesArr));
      });
    }
    /**
     * @param {HTMLElement | NodeListOf<HTMLElement>} $ele
     * @param {string} classNames
     */

  }, {
    key: "removeClass",
    value: function removeClass($ele, classNames) {
      if (!$ele) {
        return;
      }

      var classNamesArr = classNames.split(' ');
      DomUtils.getElements($ele).forEach(function ($this) {
        var _$this$classList2;

        (_$this$classList2 = $this.classList).remove.apply(_$this$classList2, dom_utils_toConsumableArray(classNamesArr));
      });
    }
    /**
     * @param {HTMLElement | NodeListOf<HTMLElement>} $ele
     * @param {string} classNames
     * @param {boolean} [isAdd]
     */

  }, {
    key: "toggleClass",
    value: function toggleClass($ele, classNames, isAdd) {
      if (!$ele) {
        return;
      }
      /** @type {boolean | undefined} */


      var isAdding;

      if (isAdd !== undefined) {
        isAdding = Boolean(isAdd);
      }

      DomUtils.getElements($ele).forEach(function ($this) {
        $this.classList.toggle(classNames, isAdding);
      });
    }
    /**
     * @param {HTMLElement} $ele
     * @param {string} className
     * @returns {boolean}
     */

  }, {
    key: "hasClass",
    value: function hasClass($ele, className) {
      if (!$ele) {
        return false;
      }

      return $ele.classList.contains(className);
    }
    /**
     * @param {HTMLElement} $ele
     * @returns {boolean}
     */

  }, {
    key: "hasEllipsis",
    value: function hasEllipsis($ele) {
      if (!$ele) {
        return false;
      }

      return $ele.scrollWidth > $ele.offsetWidth;
    }
    /**
     * @param {HTMLElement} $ele
     * @param {string} name
     * @param {string} [type]
     * @returns {any}
     */

  }, {
    key: "getData",
    value: function getData($ele, name, type) {
      if (!$ele) {
        return undefined;
      }
      /** @type {any} */


      var value = $ele ? $ele.dataset[name] : '';

      if (type === 'number') {
        value = parseFloat(value) || 0;
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }

      return value;
    }
    /**
     * @param {HTMLElement} $ele
     * @param {string} name
     * @param {string} value
     */

  }, {
    key: "setData",
    value: function setData($ele, name, value) {
      if (!$ele) {
        return;
      } // eslint-disable-next-line no-param-reassign


      $ele.dataset[name] = value;
    }
    /**
     * @param {HTMLElement} $ele
     * @param {string} name
     * @param {string} value
     */

  }, {
    key: "setAttr",
    value: function setAttr($ele, name, value) {
      if (!$ele) {
        return;
      }

      $ele.setAttribute(name, value);
    }
    /**
     * @param {HTMLElement} $from
     * @param {HTMLElement} $to
     * @param {string[]} attrList
     * @param {string[]} valueLessProps
     */

  }, {
    key: "setAttrFromEle",
    value: function setAttrFromEle($from, $to, attrList, valueLessProps) {
      /** @type {any} */
      var values = {};
      attrList.forEach(function (attr) {
        values[attr] = $from.getAttribute(attr);
      });
      attrList.forEach(function (attr) {
        var value = values[attr];

        if (value || valueLessProps.indexOf(attr) !== -1 && value === '') {
          $to.setAttribute(attr, value);
        }
      });
    }
    /**
     * @param {HTMLElement} $ele
     * @param {string} name
     * @param {string} value
     */

  }, {
    key: "setStyle",
    value: function setStyle($ele, name, value) {
      if (!$ele) {
        return;
      } // @ts-ignore
      // eslint-disable-next-line no-param-reassign


      $ele.style[name] = value;
    }
    /**
     * @param {HTMLElement} $ele
     * @param {any} props
     */

  }, {
    key: "setStyles",
    value: function setStyles($ele, props) {
      if (!$ele || !props) {
        return;
      }

      Object.keys(props).forEach(function (name) {
        // @ts-ignore
        // eslint-disable-next-line no-param-reassign
        $ele.style[name] = props[name];
      });
    }
    /**
     * @param {HTMLElement} $ele
     * @param {string} name
     * @param {string} value
     */

  }, {
    key: "setAria",
    value: function setAria($ele, name, value) {
      var attrName = name;

      if (attrName !== 'role') {
        attrName = "aria-".concat(attrName);
      }

      $ele.setAttribute(attrName, value);
    }
    /**
     * @param {any} $ele
     * @returns {any[]}
     */

  }, {
    key: "getElements",
    value: function getElements($ele) {
      if (!$ele) {
        return [];
      }

      return $ele.forEach === undefined ? [$ele] : $ele;
    }
    /**
     * @param {HTMLElement} $ele
     * @param {string} events
     * @param {Function} callback
     */

  }, {
    key: "addEvent",
    value: function addEvent($ele, events, callback) {
      if (!$ele) {
        return;
      }

      var eventsArray = Utils.removeArrayEmpty(events.split(' '));
      eventsArray.forEach(function (event) {
        var $eleArray = DomUtils.getElements($ele);
        $eleArray.forEach(function ($this) {
          $this.addEventListener(event, callback);
        });
      });
    }
    /**
     * @param {HTMLElement} $ele
     * @param {string} eventName
     * @param {boolean} [bubbles]
     */

  }, {
    key: "dispatchEvent",
    value: function dispatchEvent($ele, eventName) {
      var bubbles = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (!$ele) {
        return;
      }

      var $eleArray = DomUtils.getElements($ele);
      /** using setTimeout to trigger asynchronous event */

      setTimeout(function () {
        $eleArray.forEach(function ($this) {
          $this.dispatchEvent(new CustomEvent(eventName, {
            bubbles: bubbles
          }));
        });
      }, 0);
    }
    /**
     * convert object to dom attributes
     * @param {any} data
     */

  }, {
    key: "getAttributesText",
    value: function getAttributesText(data) {
      var html = '';

      if (!data) {
        return html;
      }

      Object.entries(data).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            k = _ref2[0],
            v = _ref2[1];

        if (v !== undefined) {
          html += " ".concat(k, "=\"").concat(v, "\" ");
        }
      });
      return html;
    }
    /**
     * convert "maxValue" to "data-max-value"
     * @param {string} prop
     */

  }, {
    key: "convertPropToDataAttr",
    value: function convertPropToDataAttr(prop) {
      return prop ? "data-".concat(prop).replace(/([A-Z])/g, '-$1').toLowerCase() : '';
    }
  }]);

  return DomUtils;
}();
;// CONCATENATED MODULE: ./src/virtual-select.js
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = virtual_select_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function virtual_select_slicedToArray(arr, i) { return virtual_select_arrayWithHoles(arr) || virtual_select_iterableToArrayLimit(arr, i) || virtual_select_unsupportedIterableToArray(arr, i) || virtual_select_nonIterableRest(); }

function virtual_select_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function virtual_select_iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function virtual_select_arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function virtual_select_toConsumableArray(arr) { return virtual_select_arrayWithoutHoles(arr) || virtual_select_iterableToArray(arr) || virtual_select_unsupportedIterableToArray(arr) || virtual_select_nonIterableSpread(); }

function virtual_select_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function virtual_select_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return virtual_select_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return virtual_select_arrayLikeToArray(o, minLen); }

function virtual_select_iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function virtual_select_arrayWithoutHoles(arr) { if (Array.isArray(arr)) return virtual_select_arrayLikeToArray(arr); }

function virtual_select_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function virtual_select_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function virtual_select_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function virtual_select_createClass(Constructor, protoProps, staticProps) { if (protoProps) virtual_select_defineProperties(Constructor.prototype, protoProps); if (staticProps) virtual_select_defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

/* eslint-disable */
// @ts-nocheck

var dropboxCloseButtonFullHeight = 48;
var searchHeight = 40;
var keyDownMethodMapping = {
  13: 'onEnterPress',
  38: 'onUpArrowPress',
  40: 'onDownArrowPress'
};
var valueLessProps = ['autofocus', 'disabled', 'multiple', 'required'];
var nativeProps = ['autofocus', 'class', 'disabled', 'id', 'multiple', 'name', 'placeholder', 'required'];
var dataProps = ['additionalClasses', 'aliasKey', 'allOptionsSelectedText', 'allowNewOption', 'alwaysShowSelectedOptionsCount', 'ariaLabelledby', 'autoSelectFirstOption', 'clearButtonText', 'descriptionKey', 'disableAllOptionsSelectedText', 'disableOptionGroupCheckbox', 'disableSelectAll', 'disableValidation', 'dropboxWidth', 'dropboxWrapper', 'emptyValue', 'enableSecureText', 'hasOptionDescription', 'hideClearButton', 'hideValueTooltipOnSelectAll', 'keepAlwaysOpen', 'labelKey', 'markSearchResults', 'maxValues', 'maxWidth', 'moreText', 'noOfDisplayValues', 'noOptionsText', 'noSearchResultsText', 'optionHeight', 'optionSelectedText', 'optionsCount', 'optionsSelectedText', 'popupDropboxBreakpoint', 'popupPosition', 'position', 'search', 'searchGroup', 'searchPlaceholderText', 'selectAllOnlyVisible', 'selectAllText', 'setValueAsArray', 'showDropboxAsPopup', 'showOptionsOnlyOnSearch', 'showSelectedOptionsFirst', 'showValueAsTags', 'silentInitialValueSet', 'textDirection', 'tooltipAlignment', 'tooltipFontSize', 'tooltipMaxWidth', 'useGroupValue', 'valueKey', 'zIndex'];
/** Class representing VirtualSelect */

var VirtualSelect = /*#__PURE__*/function () {
  /**
   * @param {virtualSelectOptions} options
   */
  function VirtualSelect(options) {
    virtual_select_classCallCheck(this, VirtualSelect);

    try {
      this.createSecureTextElements();
      this.setProps(options);
      this.setDisabledOptions(options.disabledOptions);
      this.setOptions(options.options);
      this.render();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Couldn't initiate Virtual Select"); // eslint-disable-next-line no-console

      console.error(e);
    }
  }
  /** render methods - start */


  virtual_select_createClass(VirtualSelect, [{
    key: "render",
    value: function render() {
      if (!this.$ele) {
        return;
      }

      var uniqueId = this.uniqueId;
      var wrapperClasses = 'vscomp-wrapper';
      var valueTooltip = this.getTooltipAttrText(this.placeholder, true, true);
      var clearButtonTooltip = this.getTooltipAttrText(this.clearButtonText);
      var ariaLabelledbyText = this.ariaLabelledby ? "aria-labelledby=\"".concat(this.ariaLabelledby, "\"") : '';
      var isExpanded = false;

      if (this.additionalClasses) {
        wrapperClasses += " ".concat(this.additionalClasses);
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
        wrapperClasses += " text-direction-".concat(this.textDirection);
      }

      if (this.popupPosition) {
        wrapperClasses += " popup-position-".concat(this.popupPosition.toLowerCase());
      }

      var html = "<div id=\"vscomp-ele-wrapper-".concat(uniqueId, "\" class=\"vscomp-ele-wrapper ").concat(wrapperClasses, "\" tabindex=\"0\"\n        role=\"combobox\" aria-haspopup=\"listbox\" aria-controls=\"vscomp-dropbox-container-").concat(uniqueId, "\"\n        aria-expanded=\"").concat(isExpanded, "\" ").concat(ariaLabelledbyText, "\n      >\n        <input type=\"hidden\" name=\"").concat(this.name, "\" class=\"vscomp-hidden-input\">\n\n        <div class=\"vscomp-toggle-button\">\n          <div class=\"vscomp-value\" ").concat(valueTooltip, ">\n            ").concat(this.placeholder, "\n          </div>\n\n          <div class=\"vscomp-arrow\"></div>\n\n          <div class=\"vscomp-clear-button toggle-button-child\" ").concat(clearButtonTooltip, ">\n            <i class=\"vscomp-clear-icon\"></i>\n          </div>\n        </div>\n\n        ").concat(this.renderDropbox({
        wrapperClasses: wrapperClasses
      }), "\n      </div>");
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
  }, {
    key: "renderDropbox",
    value: function renderDropbox(_ref) {
      var wrapperClasses = _ref.wrapperClasses;
      var $wrapper = this.dropboxWrapper !== 'self' ? document.querySelector(this.dropboxWrapper) : null;
      var html = "<div id=\"vscomp-dropbox-container-".concat(this.uniqueId, "\" role=\"listbox\" class=\"vscomp-dropbox-container\">\n        <div class=\"vscomp-dropbox\">\n          <div class=\"vscomp-search-wrapper\"></div>\n\n          <div class=\"vscomp-options-container\">\n            <div class=\"vscomp-options-loader\"></div>\n\n            <div class=\"vscomp-options-list\">\n              <div class=\"vscomp-options\"></div>\n            </div>\n          </div>\n\n          <div class=\"vscomp-options-bottom-freezer\"></div>\n          <div class=\"vscomp-no-options\">").concat(this.noOptionsText, "</div>\n          <div class=\"vscomp-no-search-results\">").concat(this.noSearchResultsText, "</div>\n\n          <span class=\"vscomp-dropbox-close-button\"><i class=\"vscomp-clear-icon\"></i></span>\n        </div>\n      </div>");

      if ($wrapper) {
        var $dropboxWrapper = document.createElement('div');
        this.$dropboxWrapper = $dropboxWrapper;
        this.hasDropboxWrapper = true;
        $dropboxWrapper.innerHTML = html;
        $wrapper.appendChild($dropboxWrapper);
        DomUtils.addClass($dropboxWrapper, "vscomp-dropbox-wrapper ".concat(wrapperClasses));
        return '';
      }

      this.hasDropboxWrapper = false;
      return html;
    }
  }, {
    key: "renderOptions",
    value: function renderOptions() {
      var _this = this;

      var html = '';
      var visibleOptions = this.getVisibleOptions();
      var checkboxHtml = '';
      var newOptionIconHtml = '';
      var markSearchResults = !!(this.markSearchResults && this.searchValue);
      var searchRegex;
      var labelRenderer = this.labelRenderer,
          disableOptionGroupCheckbox = this.disableOptionGroupCheckbox,
          uniqueId = this.uniqueId,
          searchGroup = this.searchGroup;
      var hasLabelRenderer = typeof labelRenderer === 'function';
      var convertToBoolean = Utils.convertToBoolean;

      if (markSearchResults) {
        searchRegex = new RegExp("(".concat(this.searchValue, ")"), 'gi');
      }

      if (this.multiple) {
        checkboxHtml = '<span class="checkbox-icon"></span>';
      }

      if (this.allowNewOption) {
        var newOptionTooltip = this.getTooltipAttrText('New Option');
        newOptionIconHtml = "<span class=\"vscomp-new-option-icon\" ".concat(newOptionTooltip, "></span>");
      }

      visibleOptions.forEach(function (d) {
        var index = d.index;
        var optionLabel;
        var optionClasses = 'vscomp-option';

        var optionTooltip = _this.getTooltipAttrText('', true, true);

        var leftSection = checkboxHtml;
        var rightSection = '';
        var description = '';
        var groupIndexText = '';
        var isSelected = convertToBoolean(d.isSelected);
        var ariaDisabledText = '';

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
          groupIndexText = "data-group-index=\"".concat(d.groupIndex, "\"");
        }

        if (hasLabelRenderer) {
          optionLabel = labelRenderer(d);
        } else {
          optionLabel = d.label;
        }

        if (d.description) {
          description = "<div class=\"vscomp-option-description\" ".concat(optionTooltip, ">").concat(d.description, "</div>");
        }

        if (d.isCurrentNew) {
          optionClasses += ' current-new';
          rightSection += newOptionIconHtml;
        } else if (markSearchResults && (!d.isGroupTitle || searchGroup)) {
          optionLabel = optionLabel.replace(searchRegex, '<mark>$1</mark>');
        }

        html += "<div role=\"option\" aria-selected=\"".concat(isSelected, "\" id=\"vscomp-option-").concat(uniqueId, "-").concat(index, "\"\n          class=\"").concat(optionClasses, "\" data-value=\"").concat(d.value, "\" data-index=\"").concat(index, "\" data-visible-index=\"").concat(d.visibleIndex, "\"\n          ").concat(groupIndexText, " ").concat(ariaDisabledText, "\n        >\n          ").concat(leftSection, "\n          <span class=\"vscomp-option-text\" ").concat(optionTooltip, ">\n            ").concat(optionLabel, "\n          </span>\n          ").concat(description, "\n          ").concat(rightSection, "\n        </div>");
      });
      this.$options.innerHTML = html;
      this.$visibleOptions = this.$options.querySelectorAll('.vscomp-option');
      this.afterRenderOptions();
    }
  }, {
    key: "renderSearch",
    value: function renderSearch() {
      if (!this.hasSearchContainer) {
        return;
      }

      var checkboxHtml = '';
      var searchInput = '';

      if (this.multiple && !this.disableSelectAll) {
        checkboxHtml = "<span class=\"vscomp-toggle-all-button\">\n          <span class=\"checkbox-icon vscomp-toggle-all-checkbox\"></span>\n          <span class=\"vscomp-toggle-all-label\">".concat(this.selectAllText, "</span>\n        </span>");
      }

      if (this.hasSearch) {
        searchInput = "<input type=\"text\" class=\"vscomp-search-input\" placeholder=\"".concat(this.searchPlaceholderText, "\">\n      <span class=\"vscomp-search-clear\">&times;</span>");
      }

      var html = "<div class=\"vscomp-search-container\">\n        ".concat(checkboxHtml, "\n        ").concat(searchInput, "\n      </div>");
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

  }, {
    key: "addEvents",
    value: function addEvents() {
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
  }, {
    key: "addEvent",
    value: function addEvent($ele, events, method) {
      var _this2 = this;

      if (!$ele) {
        return;
      }

      var eventsArray = Utils.removeArrayEmpty(events.split(' '));
      eventsArray.forEach(function (event) {
        var eventsKey = "".concat(method, "-").concat(event);
        var callback = _this2.events[eventsKey];

        if (!callback) {
          callback = _this2[method].bind(_this2);
          _this2.events[eventsKey] = callback;
        }

        DomUtils.addEvent($ele, event, callback);
      });
    }
  }, {
    key: "onDocumentClick",
    value: function onDocumentClick(e) {
      var $eleToKeepOpen = e.target.closest('.vscomp-wrapper');

      if ($eleToKeepOpen !== this.$wrapper && $eleToKeepOpen !== this.$dropboxWrapper && this.isOpened()) {
        this.closeDropbox();
      }
    }
  }, {
    key: "onKeyDown",
    value: function onKeyDown(e) {
      var key = e.which || e.keyCode;
      var method = keyDownMethodMapping[key];

      if (method) {
        this[method](e);
      }
    }
  }, {
    key: "onEnterPress",
    value: function onEnterPress(e) {
      e.preventDefault();

      if (this.isOpened()) {
        this.selectFocusedOption();
      } else {
        this.openDropbox();
      }
    }
  }, {
    key: "onDownArrowPress",
    value: function onDownArrowPress(e) {
      e.preventDefault();

      if (this.isOpened()) {
        this.focusOption({
          direction: 'next'
        });
      } else {
        this.openDropbox();
      }
    }
  }, {
    key: "onUpArrowPress",
    value: function onUpArrowPress(e) {
      e.preventDefault();

      if (this.isOpened()) {
        this.focusOption({
          direction: 'previous'
        });
      } else {
        this.openDropbox();
      }
    }
  }, {
    key: "onToggleButtonClick",
    value: function onToggleButtonClick(e) {
      var $target = e.target;

      if ($target.closest('.vscomp-value-tag-clear-button')) {
        this.removeValue($target.closest('.vscomp-value-tag'));
      } else if (!$target.closest('.toggle-button-child')) {
        this.toggleDropbox();
      }
    }
  }, {
    key: "onClearButtonClick",
    value: function onClearButtonClick() {
      this.reset();
    }
  }, {
    key: "onOptionsScroll",
    value: function onOptionsScroll() {
      this.setVisibleOptions();
    }
  }, {
    key: "onOptionsClick",
    value: function onOptionsClick(e) {
      var $option = e.target.closest('.vscomp-option');

      if ($option && !DomUtils.hasClass($option, 'disabled')) {
        if (DomUtils.hasClass($option, 'group-title')) {
          this.onGroupTitleClick($option);
        } else {
          this.selectOption($option, {
            event: e
          });
        }
      }
    }
  }, {
    key: "onGroupTitleClick",
    value: function onGroupTitleClick($ele) {
      if (!$ele || !this.multiple || this.disableOptionGroupCheckbox) {
        return;
      }

      var isAdding = !DomUtils.hasClass($ele, 'selected');
      this.toggleGroupTitleCheckbox($ele, isAdding);
      this.toggleGroupOptions($ele, isAdding);
    }
  }, {
    key: "onDropboxContainerClick",
    value: function onDropboxContainerClick(e) {
      if (!e.target.closest('.vscomp-dropbox')) {
        this.closeDropbox();
      }
    }
  }, {
    key: "onDropboxCloseButtonClick",
    value: function onDropboxCloseButtonClick() {
      this.closeDropbox();
    }
  }, {
    key: "onOptionsMouseOver",
    value: function onOptionsMouseOver(e) {
      var $ele = e.target.closest('.vscomp-option');

      if ($ele && this.isOpened()) {
        if (DomUtils.hasClass($ele, 'disabled') || DomUtils.hasClass($ele, 'group-title')) {
          this.removeOptionFocus();
        } else {
          this.focusOption({
            $option: $ele
          });
        }
      }
    }
  }, {
    key: "onOptionsTouchMove",
    value: function onOptionsTouchMove() {
      this.removeOptionFocus();
    }
  }, {
    key: "onSearch",
    value: function onSearch(e) {
      e.stopPropagation();
      this.setSearchValue(e.target.value, true);
    }
  }, {
    key: "onSearchClear",
    value: function onSearchClear() {
      this.setSearchValue('');
      this.focusSearchInput();
    }
  }, {
    key: "onToggleAllOptions",
    value: function onToggleAllOptions() {
      this.toggleAllOptions();
    }
  }, {
    key: "onResize",
    value: function onResize() {
      this.setOptionsContainerHeight(true);
    }
    /** to remove dropboxWrapper on removing vscomp-ele when it is rendered outside of vscomp-ele */

  }, {
    key: "addMutationObserver",
    value: function addMutationObserver() {
      var _this3 = this;

      if (!this.hasDropboxWrapper) {
        return;
      }

      var $vscompEle = this.$ele;
      this.mutationObserver = new MutationObserver(function (mutations) {
        mutations.some(function (mutation) {
          var $removedNodes = virtual_select_toConsumableArray(mutation.removedNodes);

          var isMatching = $removedNodes.some(function ($ele) {
            return !!($ele === $vscompEle || $ele.contains($vscompEle));
          });

          if (isMatching) {
            _this3.destroy();
          }

          return isMatching;
        });
      });
      this.mutationObserver.observe(document.querySelector('body'), {
        childList: true,
        subtree: true
      });
    }
    /** dom event methods - end */

    /** before event methods - start */

  }, {
    key: "beforeValueSet",
    value: function beforeValueSet(isReset) {
      this.toggleAllOptionsClass(isReset ? false : undefined);
    }
  }, {
    key: "beforeSelectNewValue",
    value: function beforeSelectNewValue() {
      var _this4 = this;

      var newOption = this.getNewOption();
      var newIndex = newOption.index;
      this.newValues.push(newOption.value);
      this.setOptionProp(newIndex, 'isCurrentNew', false);
      this.setOptionProp(newIndex, 'isNew', true);
      /** using setTimeout to fix the issue of dropbox getting closed on select */

      setTimeout(function () {
        _this4.setSearchValue('');

        _this4.focusSearchInput();
      }, 0);
    }
    /** before event methods - end */

    /** after event methods - start */

  }, {
    key: "afterRenderWrapper",
    value: function afterRenderWrapper() {
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
  }, {
    key: "afterRenderOptions",
    value: function afterRenderOptions() {
      var visibleOptions = this.getVisibleOptions();
      var hasNoOptions = !this.options.length && !this.hasServerSearch;
      var hasNoSearchResults = !hasNoOptions && !visibleOptions.length;

      if (!this.allowNewOption || this.hasServerSearch || this.showOptionsOnlyOnSearch) {
        DomUtils.toggleClass(this.$allWrappers, 'has-no-search-results', hasNoSearchResults);
      }

      DomUtils.toggleClass(this.$allWrappers, 'has-no-options', hasNoOptions);
      this.setOptionAttr();
      this.setOptionsPosition();
      this.setOptionsTooltip();
    }
  }, {
    key: "afterSetOptionsContainerHeight",
    value: function afterSetOptionsContainerHeight(reset) {
      if (reset) {
        if (this.showAsPopup) {
          this.setVisibleOptions();
        }
      }
    }
  }, {
    key: "afterSetSearchValue",
    value: function afterSetSearchValue() {
      if (this.hasServerSearch) {
        this.serverSearch();
      } else {
        this.setVisibleOptionsCount();
      }

      if (this.selectAllOnlyVisible) {
        this.toggleAllOptionsClass();
      }

      this.focusOption({
        focusFirst: true
      });
    }
  }, {
    key: "afterSetVisibleOptionsCount",
    value: function afterSetVisibleOptionsCount() {
      this.scrollToTop();
      this.setOptionsHeight();
      this.setVisibleOptions();
      this.updatePosition();
    }
  }, {
    key: "afterValueSet",
    value: function afterValueSet() {
      this.scrollToTop();
      this.setSearchValue('');
      this.renderOptions();
    }
  }, {
    key: "afterSetOptions",
    value: function afterSetOptions(keepValue) {
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

  }, {
    key: "setProps",
    value: function setProps(params) {
      var options = this.setDefaultProps(params);
      this.setPropsFromElementAttr(options);
      var convertToBoolean = Utils.convertToBoolean;
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
      this.noOfDisplayValues = parseInt(options.noOfDisplayValues);
      this.zIndex = parseInt(options.zIndex);
      this.maxValues = parseInt(options.maxValues);
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

      if (options.search === undefined && this.multiple || this.allowNewOption || this.showOptionsOnlyOnSearch) {
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

      this.showAsPopup = this.showDropboxAsPopup && !this.keepAlwaysOpen && window.innerWidth <= parseFloat(this.popupDropboxBreakpoint);
      this.hasSearchContainer = this.hasSearch || this.multiple && !this.disableSelectAll;
      this.optionsCount = this.getOptionsCount(options.optionsCount);
      this.halfOptionsCount = Math.ceil(this.optionsCount / 2);
      this.optionsHeight = this.getOptionsHeight();
      this.uniqueId = this.getUniqueId();
    }
    /**
     * @param {virtualSelectOptions} options
     */

  }, {
    key: "setDefaultProps",
    value: function setDefaultProps(options) {
      var defaultOptions = {
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
        name: '',
        additionalClasses: '',
        maxValues: 0,
        showDropboxAsPopup: true,
        popupDropboxBreakpoint: '576px',
        popupPosition: 'center',
        hideValueTooltipOnSelectAll: true,
        emptyValue: ''
      };

      if (options.hasOptionDescription) {
        defaultOptions.optionsCount = 4;
        defaultOptions.optionHeight = '50px';
      }

      return Object.assign(defaultOptions, options);
    }
  }, {
    key: "setPropsFromElementAttr",
    value: function setPropsFromElementAttr(options) {
      var $ele = options.ele;

      for (var k in attrPropsMapping) {
        var value = $ele.getAttribute(k);

        if (valueLessProps.indexOf(k) !== -1 && (value === '' || value === 'true')) {
          value = true;
        }

        if (value) {
          options[attrPropsMapping[k]] = value;
        }
      }
    }
  }, {
    key: "setEleProps",
    value: function setEleProps() {
      var $ele = this.$ele;
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
      $ele.toggleSelectAll = VirtualSelect.toggleSelectAll;
      $ele.isAllSelected = VirtualSelect.isAllSelected;
      $ele.addOption = VirtualSelect.addOptionMethod;
      $ele.getNewValue = VirtualSelect.getNewValueMethod;
      $ele.getDisplayValue = VirtualSelect.getDisplayValueMethod;
      $ele.getSelectedOptions = VirtualSelect.getSelectedOptionsMethod;
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
  }, {
    key: "setValueMethod",
    value: function setValueMethod(newValue, silentChange) {
      var valuesMapping = {};
      var valuesOrder = {};
      var validValues = [];
      var isMultiSelect = this.multiple;
      var value = newValue;

      if (value) {
        if (!Array.isArray(value)) {
          value = [value];
        }

        if (isMultiSelect) {
          var maxValues = this.maxValues;

          if (maxValues && value.length > maxValues) {
            value.splice(maxValues);
          }
        } else {
          if (value.length > 1) {
            value = [value[0]];
          }
        }

        value = value.map(function (v) {
          return v || v == 0 ? v.toString() : '';
        });

        if (this.useGroupValue) {
          value = this.setGroupOptionsValue(value);
        }

        value.forEach(function (d, i) {
          valuesMapping[d] = true;
          valuesOrder[d] = i;
        });

        if (this.allowNewOption && value) {
          this.setNewOptionsFromValue(value);
        }
      }

      this.options.forEach(function (d) {
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


        validValues.sort(function (a, b) {
          return valuesOrder[a] - valuesOrder[b];
        });
      } else {
        /** taking first value for single select */
        var _validValues = validValues;

        var _validValues2 = virtual_select_slicedToArray(_validValues, 1);

        validValues = _validValues2[0];
      }

      this.beforeValueSet();
      this.setValue(validValues, {
        disableEvent: silentChange
      });
      this.afterValueSet();
    }
  }, {
    key: "setGroupOptionsValue",
    value: function setGroupOptionsValue(preparedValues) {
      var selectedValues = [];
      var selectedGroups = {};
      var valuesMapping = {};
      preparedValues.forEach(function (d) {
        valuesMapping[d] = true;
      });
      this.options.forEach(function (d) {
        var value = d.value;
        var isSelected = valuesMapping[value] === true;

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
  }, {
    key: "setGroupsSelectedProp",
    value: function setGroupsSelectedProp() {
      var isAllGroupOptionsSelected = this.isAllGroupOptionsSelected.bind(this);
      this.options.forEach(function (d) {
        if (d.isGroupTitle) {
          // eslint-disable-next-line no-param-reassign
          d.isSelected = isAllGroupOptionsSelected(d.index);
        }
      });
    }
  }, {
    key: "setOptionsMethod",
    value: function setOptionsMethod(options, keepValue) {
      this.setOptions(options);
      this.afterSetOptions(keepValue);
    }
  }, {
    key: "setDisabledOptionsMethod",
    value: function setDisabledOptionsMethod(disabledOptions) {
      var keepValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.setDisabledOptions(disabledOptions, true);

      if (!keepValue) {
        this.setValueMethod(null);
        this.toggleAllOptionsClass();
      }

      this.setVisibleOptions();
    }
  }, {
    key: "setDisabledOptions",
    value: function setDisabledOptions(disabledOptions) {
      var setOptionsProp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var disabledOptionsArr = [];

      if (!disabledOptions) {
        if (setOptionsProp) {
          this.options.forEach(function (d) {
            // eslint-disable-next-line no-param-reassign
            d.isDisabled = false;
            return d;
          });
        }
      } else if (disabledOptions === true) {
        if (setOptionsProp) {
          this.options.forEach(function (d) {
            // eslint-disable-next-line no-param-reassign
            d.isDisabled = true;
            disabledOptionsArr.push(d.value);
            return d;
          });
        }
      } else {
        disabledOptionsArr = disabledOptions.map(function (d) {
          return d.toString();
        });
        var disabledOptionsMapping = {};
        disabledOptionsArr.forEach(function (d) {
          disabledOptionsMapping[d] = true;
        });

        if (setOptionsProp) {
          this.options.forEach(function (d) {
            // eslint-disable-next-line no-param-reassign
            d.isDisabled = disabledOptionsMapping[d.value] === true;
            return d;
          });
        }
      }

      this.disabledOptions = disabledOptionsArr;
    }
  }, {
    key: "setOptions",
    value: function setOptions(options) {
      if (!options) {
        options = [];
      }

      var preparedOptions = [];
      var hasDisabledOptions = this.disabledOptions.length;
      var valueKey = this.valueKey,
          labelKey = this.labelKey,
          descriptionKey = this.descriptionKey,
          aliasKey = this.aliasKey,
          hasOptionDescription = this.hasOptionDescription;
      var getString = Utils.getString,
          convertToBoolean = Utils.convertToBoolean;
      var secureText = this.secureText.bind(this);
      var getAlias = this.getAlias.bind(this);
      var index = 0;
      var hasOptionGroup = false;
      var disabledOptionsMapping = {};
      var hasEmptyValueOption = false;
      this.disabledOptions.forEach(function (d) {
        disabledOptionsMapping[d] = true;
      });

      var prepareOption = function prepareOption(d) {
        var value = secureText(getString(d[valueKey]));
        var childOptions = d.options;
        var isGroupTitle = childOptions ? true : false;
        var option = {
          index: index,
          value: value,
          label: secureText(getString(d[labelKey])),
          alias: getAlias(d[aliasKey]),
          isVisible: convertToBoolean(d.isVisible, true),
          isNew: d.isNew || false,
          isGroupTitle: isGroupTitle
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
          var groupIndex = option.index;
          hasOptionGroup = true;
          childOptions.forEach(function (d) {
            // eslint-disable-next-line no-param-reassign
            d.isGroupOption = true; // eslint-disable-next-line no-param-reassign

            d.groupIndex = groupIndex;
            prepareOption(d);
          });
        }
      };

      options.forEach(prepareOption);
      var optionsLength = preparedOptions.length;
      var $ele = this.$ele;
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
  }, {
    key: "setServerOptions",
    value: function setServerOptions() {
      var _this5 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      this.setOptionsMethod(options, true);
      var selectedOptions = this.selectedOptions;
      var newOptions = this.options;
      var optionsUpdated = false;
      /** merging already seleted options details with new options */

      if (selectedOptions.length) {
        var newOptionsValueMapping = {};
        optionsUpdated = true;
        newOptions.forEach(function (d) {
          newOptionsValueMapping[d.value] = true;
        });
        selectedOptions.forEach(function (d) {
          if (newOptionsValueMapping[d.value] === false) {
            // eslint-disable-next-line no-param-reassign
            d.isVisible = false;
            newOptions.push(d);
          }
        });
        this.setOptionsMethod(newOptions, true);
      }
      /** merging new search option */


      if (this.allowNewOption && this.searchValue) {
        var hasExactOption = newOptions.some(function (d) {
          return d.label.toLowerCase() === _this5.searchValue;
        });

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
  }, {
    key: "setSelectedOptions",
    value: function setSelectedOptions() {
      this.selectedOptions = this.options.filter(function (d) {
        return d.isSelected;
      });
    }
  }, {
    key: "setSortedOptions",
    value: function setSortedOptions() {
      var sortedOptions = virtual_select_toConsumableArray(this.options);

      if (this.showSelectedOptionsFirst && this.selectedValues.length) {
        if (this.hasOptionGroup) {
          sortedOptions = this.sortOptionsGroup(sortedOptions);
        } else {
          sortedOptions = this.sortOptions(sortedOptions);
        }
      }

      this.sortedOptions = sortedOptions;
    }
  }, {
    key: "setVisibleOptions",
    value: function setVisibleOptions() {
      var visibleOptions = virtual_select_toConsumableArray(this.sortedOptions);

      var maxOptionsToShow = this.optionsCount * 2;
      var startIndex = this.getVisibleStartIndex();
      var newOption = this.getNewOption();
      var endIndex = startIndex + maxOptionsToShow - 1;
      var i = 0;

      if (newOption) {
        newOption.visibleIndex = i;
        i++;
      }

      visibleOptions = visibleOptions.filter(function (d) {
        var inView = false;

        if (d.isVisible && !d.isCurrentNew) {
          inView = i >= startIndex && i <= endIndex; // eslint-disable-next-line no-param-reassign

          d.visibleIndex = i;
          i += 1;
        }

        return inView;
      });

      if (newOption) {
        visibleOptions = [newOption].concat(virtual_select_toConsumableArray(visibleOptions));
      }

      this.visibleOptions = visibleOptions;
      this.renderOptions();
    }
  }, {
    key: "setOptionsPosition",
    value: function setOptionsPosition(startIndex) {
      if (startIndex === undefined) {
        startIndex = this.getVisibleStartIndex();
      }

      var top = startIndex * this.optionHeight;
      this.$options.style.transform = "translate3d(0, ".concat(top, "px, 0)");
      DomUtils.setData(this.$options, 'top', top);
    }
  }, {
    key: "setOptionsTooltip",
    value: function setOptionsTooltip() {
      var _this6 = this;

      var visibleOptions = this.getVisibleOptions();
      var hasOptionDescription = this.hasOptionDescription;
      visibleOptions.forEach(function (d) {
        var $optionEle = _this6.$dropboxContainer.querySelector(".vscomp-option[data-index=\"".concat(d.index, "\"]"));

        DomUtils.setData($optionEle.querySelector('.vscomp-option-text'), 'tooltip', d.label);

        if (hasOptionDescription) {
          DomUtils.setData($optionEle.querySelector('.vscomp-option-description'), 'tooltip', d.description);
        }
      });
    }
  }, {
    key: "setValue",
    value: function setValue(value) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$disableEvent = _ref2.disableEvent,
          disableEvent = _ref2$disableEvent === void 0 ? false : _ref2$disableEvent,
          _ref2$disableValidati = _ref2.disableValidation,
          disableValidation = _ref2$disableValidati === void 0 ? false : _ref2$disableValidati;

      var isValidValue = this.hasEmptyValueOption && value === '' || value;

      if (!isValidValue) {
        this.selectedValues = [];
      } else if (Array.isArray(value)) {
        this.selectedValues = virtual_select_toConsumableArray(value);
      } else {
        this.selectedValues = [value];
      }

      var newValue = this.getValue();
      this.$ele.value = newValue;
      this.$hiddenInput.value = this.getInputValue(newValue);
      this.isMaxValuesSelected = this.maxValues && this.maxValues <= this.selectedValues.length ? true : false;
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
  }, {
    key: "setValueText",
    value: function setValueText() {
      var multiple = this.multiple,
          selectedValues = this.selectedValues,
          noOfDisplayValues = this.noOfDisplayValues,
          showValueAsTags = this.showValueAsTags,
          $valueText = this.$valueText;
      var valueText = [];
      var valueTooltip = [];
      var selectedLength = selectedValues.length;
      var selectedValuesCount = 0;
      var showAllText = this.isAllSelected && !this.hasServerSearch && !this.disableAllOptionsSelectedText && !showValueAsTags;
      /** show all values selected text without tooltip text */

      if (showAllText && this.hideValueTooltipOnSelectAll) {
        $valueText.innerHTML = "".concat(this.allOptionsSelectedText, " (").concat(selectedLength, ")");
      } else {
        var selectedOptions = this.getSelectedOptions({
          fullDetails: true,
          keepSelectionOrder: true
        });

        var _iterator = _createForOfIteratorHelper(selectedOptions),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var d = _step.value;

            if (d.isCurrentNew) {
              continue;
            }

            if (selectedValuesCount >= noOfDisplayValues) {
              break;
            }

            var label = d.label;
            valueText.push(label);
            selectedValuesCount++;

            if (showValueAsTags) {
              var valueTagHtml = "<span class=\"vscomp-value-tag\" data-index=\"".concat(d.index, "\">\n              <span class=\"vscomp-value-tag-content\">").concat(label, "</span>\n              <span class=\"vscomp-value-tag-clear-button\">\n                <i class=\"vscomp-clear-icon\"></i>\n              </span>\n            </span>");
              valueTooltip.push(valueTagHtml);
            } else {
              valueTooltip.push(label);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        var moreSelectedOptions = selectedLength - noOfDisplayValues;

        if (moreSelectedOptions > 0) {
          valueTooltip.push("<span class=\"vscomp-value-tag more-value-count\">+ ".concat(moreSelectedOptions, " ").concat(this.moreText, "</span>"));
        }

        var aggregatedValueText = valueText.join(', ');

        if (aggregatedValueText === '') {
          $valueText.innerHTML = this.placeholder;
        } else {
          $valueText.innerHTML = aggregatedValueText;

          if (multiple) {
            var maxValues = this.maxValues;

            if (DomUtils.hasEllipsis($valueText) || maxValues || this.alwaysShowSelectedOptionsCount || showValueAsTags) {
              var countText = "<span class=\"vscomp-selected-value-count\">".concat(selectedLength, "</span>");

              if (maxValues) {
                countText += " / <span class=\"vscomp-max-value-count\">".concat(maxValues, "</span>");
              }
              /** show all values selected text with tooltip text */


              if (showAllText) {
                $valueText.innerHTML = "".concat(this.allOptionsSelectedText, " (").concat(selectedLength, ")");
              } else if (showValueAsTags) {
                $valueText.innerHTML = valueTooltip.join('');
                this.$valueTags = $valueText.querySelectorAll('.vscomp-value-tag');
                this.setValueTagAttr();
              } else {
                /** replace comma delimitted list of selections with shorter text indicating selection count */
                var optionsSelectedText = selectedLength === 1 ? this.optionSelectedText : this.optionsSelectedText;
                $valueText.innerHTML = "".concat(countText, " ").concat(optionsSelectedText);
              }
            } else {
              /** removing tooltip if full value text is visible */
              valueTooltip = [];
            }
          }
        }
      }

      var tooltipText = '';

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
  }, {
    key: "setSearchValue",
    value: function setSearchValue(value) {
      var skipInputSet = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var forceSet = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (value === this.searchValueOriginal && !forceSet) {
        return;
      }

      if (!skipInputSet) {
        this.$searchInput.value = value;
      }

      var searchValue = value.replace(/\\/g, '').toLowerCase().trim();
      this.searchValue = searchValue;
      this.searchValueOriginal = value;
      DomUtils.toggleClass(this.$allWrappers, 'has-search-value', value);
      this.afterSetSearchValue();
    }
  }, {
    key: "setVisibleOptionsCount",
    value: function setVisibleOptionsCount() {
      var visibleOptionsCount = 0;
      var hasExactOption = false;
      var visibleOptionGroupsMapping;
      var searchValue = this.searchValue,
          searchGroup = this.searchGroup,
          showOptionsOnlyOnSearch = this.showOptionsOnlyOnSearch;
      var isOptionVisible = this.isOptionVisible.bind(this);

      if (this.hasOptionGroup) {
        visibleOptionGroupsMapping = this.getVisibleOptionGroupsMapping(searchValue);
      }

      this.options.forEach(function (d) {
        if (d.isCurrentNew) {
          return;
        }

        var result;

        if (showOptionsOnlyOnSearch && !searchValue) {
          // eslint-disable-next-line no-param-reassign
          d.isVisible = false;
          result = {
            isVisible: false,
            hasExactOption: false
          };
        } else {
          result = isOptionVisible({
            data: d,
            searchValue: searchValue,
            hasExactOption: hasExactOption,
            visibleOptionGroupsMapping: visibleOptionGroupsMapping,
            searchGroup: searchGroup
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
          visibleOptionsCount++;
        } else {
          this.removeNewOption();
        }
      }

      this.visibleOptionsCount = visibleOptionsCount;
      this.afterSetVisibleOptionsCount();
    }
  }, {
    key: "setOptionProp",
    value: function setOptionProp(index, key, value) {
      if (!this.options[index]) {
        return;
      }

      this.options[index][key] = value;
    }
  }, {
    key: "setOptionsHeight",
    value: function setOptionsHeight() {
      this.$optionsList.style.height = this.optionHeight * this.visibleOptionsCount + 'px';
    }
  }, {
    key: "setOptionsContainerHeight",
    value: function setOptionsContainerHeight(reset) {
      var optionsHeight;

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
  }, {
    key: "setNewOption",
    value: function setNewOption(newValue) {
      var value = newValue || this.searchValueOriginal.trim();

      if (!value) {
        return;
      }

      var newOption = this.getNewOption();

      if (newOption) {
        var newIndex = newOption.index;
        this.setOptionProp(newIndex, 'value', this.secureText(value));
        this.setOptionProp(newIndex, 'label', this.secureText(value));
      } else {
        var data = {
          value: value,
          label: value
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
  }, {
    key: "setSelectedProp",
    value: function setSelectedProp() {
      var valuesMapping = {};
      this.selectedValues.forEach(function (d) {
        valuesMapping[d] = true;
      });
      this.options.forEach(function (d) {
        if (valuesMapping[d.value] === true) {
          // eslint-disable-next-line no-param-reassign
          d.isSelected = true;
        }
      });
    }
  }, {
    key: "setNewOptionsFromValue",
    value: function setNewOptionsFromValue(values) {
      if (!values) {
        return;
      }

      var setNewOption = this.setNewOption.bind(this);
      var availableValuesMapping = {};
      this.options.forEach(function (d) {
        availableValuesMapping[d.value] = true;
      });
      values.forEach(function (d) {
        if (d && availableValuesMapping[d] !== true) {
          setNewOption(d);
        }
      });
    }
  }, {
    key: "setDropboxWrapperWidth",
    value: function setDropboxWrapperWidth() {
      if (this.showAsPopup) {
        return;
      }

      var width = this.dropboxWidth || "".concat(this.$wrapper.offsetWidth, "px");
      DomUtils.setStyle(this.$dropboxContainer, 'max-width', width);
    }
  }, {
    key: "setEleStyles",
    value: function setEleStyles() {
      var maxWidth = this.maxWidth;
      var styles = {};

      if (maxWidth) {
        styles['max-width'] = maxWidth;
      }

      DomUtils.setStyles(this.$ele, styles);
    }
  }, {
    key: "setDropboxStyles",
    value: function setDropboxStyles() {
      var dropboxWidth = this.dropboxWidth;
      var styles = {};
      var containerStyles = {
        'z-index': this.zIndex
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
  }, {
    key: "setOptionAttr",
    value: function setOptionAttr() {
      var $visibleOptions = this.$visibleOptions;
      var options = this.options;
      var optionHeight = "".concat(this.optionHeight, "px");
      var setStyle = DomUtils.setStyle,
          getData = DomUtils.getData,
          setData = DomUtils.setData;

      if ($visibleOptions && $visibleOptions.length) {
        $visibleOptions.forEach(function ($option) {
          var optionDetails = options[getData($option, 'index')];
          setStyle($option, 'height', optionHeight);
          setData($option, 'value', optionDetails.value);
        });
      }
    }
  }, {
    key: "setValueTagAttr",
    value: function setValueTagAttr() {
      var $valueTags = this.$valueTags;

      if (!$valueTags || !$valueTags.length) {
        return;
      }

      var getData = DomUtils.getData,
          setData = DomUtils.setData;
      var options = this.options;
      $valueTags.forEach(function ($valueTag) {
        var index = getData($valueTag, 'index');

        if (typeof index !== 'undefined') {
          var optionDetails = options[index];
          setData($valueTag, 'value', optionDetails.value);
        }
      });
    }
  }, {
    key: "setScrollTop",
    value: function setScrollTop() {
      var selectedValues = this.selectedValues;

      if (this.showSelectedOptionsFirst || selectedValues.length === 0) {
        return;
      }

      var valuesMapping = {};
      var selectedOptionIndex;
      selectedValues.forEach(function (d) {
        valuesMapping[d] = true;
      });
      this.options.some(function (d) {
        if (valuesMapping[d.value]) {
          selectedOptionIndex = d.visibleIndex;
          return true;
        }
      });

      if (selectedOptionIndex) {
        this.$optionsContainer.scrollTop = this.optionHeight * selectedOptionIndex;
      }
    }
    /** set methods - end */

    /** get methods - start */

  }, {
    key: "getVisibleOptions",
    value: function getVisibleOptions() {
      return this.visibleOptions || [];
    }
  }, {
    key: "getValue",
    value: function getValue() {
      var value;

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
  }, {
    key: "getGroupValue",
    value: function getGroupValue() {
      var selectedValues = [];
      var selectedGroups = {};
      this.options.forEach(function (d) {
        if (!d.isSelected) {
          return;
        }

        var value = d.value;

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
  }, {
    key: "getInputValue",
    value: function getInputValue(preparedValue) {
      var value = preparedValue;

      if (value && value.length) {
        if (this.setValueAsArray && this.multiple) {
          value = JSON.stringify(value);
        }
      } else {
        value = this.emptyValue;
      }

      return value;
    }
  }, {
    key: "getFirstVisibleOptionIndex",
    value: function getFirstVisibleOptionIndex() {
      return Math.ceil(this.$optionsContainer.scrollTop / this.optionHeight);
    }
  }, {
    key: "getVisibleStartIndex",
    value: function getVisibleStartIndex() {
      var firstVisibleOptionIndex = this.getFirstVisibleOptionIndex();
      var startIndex = firstVisibleOptionIndex - this.halfOptionsCount;

      if (startIndex < 0) {
        startIndex = 0;
      }

      return startIndex;
    }
  }, {
    key: "getTooltipAttrText",
    value: function getTooltipAttrText(text) {
      var ellipsisOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var allowHtml = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var data = {
        'data-tooltip': text || '',
        'data-tooltip-enter-delay': this.tooltipEnterDelay,
        'data-tooltip-z-index': this.zIndex,
        'data-tooltip-font-size': this.tooltipFontSize,
        'data-tooltip-alignment': this.tooltipAlignment,
        'data-tooltip-max-width': this.tooltipMaxWidth,
        'data-tooltip-ellipsis-only': ellipsisOnly,
        'data-tooltip-allow-html': allowHtml
      };
      return DomUtils.getAttributesText(data);
    }
  }, {
    key: "getOptionObj",
    value: function getOptionObj(data) {
      if (!data) {
        return;
      }

      var getString = Utils.getString;
      var secureText = this.secureText.bind(this);
      var newOption = {
        index: data.index,
        value: secureText(getString(data.value)),
        label: secureText(getString(data.label)),
        description: secureText(getString(data.description)),
        alias: this.getAlias(data.alias),
        isCurrentNew: data.isCurrentNew || false,
        isNew: data.isNew || false,
        isVisible: true
      };
      return newOption;
    }
  }, {
    key: "getNewOption",
    value: function getNewOption() {
      var lastOption = this.options[this.lastOptionIndex];

      if (!lastOption || !lastOption.isCurrentNew) {
        return;
      }

      return lastOption;
    }
  }, {
    key: "getOptionIndex",
    value: function getOptionIndex(value) {
      var index;
      this.options.some(function (d) {
        if (d.value == value) {
          index = d.index;
          return true;
        }
      });
      return index;
    }
  }, {
    key: "getNewValue",
    value: function getNewValue() {
      var valuesMapping = {};
      this.newValues.forEach(function (d) {
        valuesMapping[d] = true;
      });
      var result = this.selectedValues.filter(function (d) {
        return valuesMapping[d] === true;
      });
      return this.multiple ? result : result[0];
    }
  }, {
    key: "getAlias",
    value: function getAlias(alias) {
      var result = alias;

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
  }, {
    key: "getDisplayValue",
    value: function getDisplayValue() {
      var displayValues = [];
      this.options.forEach(function (d) {
        if (d.isSelected) {
          displayValues.push(d.label);
        }
      });
      return this.multiple ? displayValues : displayValues[0] || '';
    }
  }, {
    key: "getSelectedOptions",
    value: function getSelectedOptions() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref3$fullDetails = _ref3.fullDetails,
          fullDetails = _ref3$fullDetails === void 0 ? false : _ref3$fullDetails,
          _ref3$keepSelectionOr = _ref3.keepSelectionOrder,
          keepSelectionOrder = _ref3$keepSelectionOr === void 0 ? false : _ref3$keepSelectionOr;

      var valueKey = this.valueKey,
          labelKey = this.labelKey,
          selectedValues = this.selectedValues;
      var selectedOptions = [];
      this.options.forEach(function (d) {
        if (d.isSelected && !d.isGroupTitle) {
          if (fullDetails) {
            selectedOptions.push(d);
          } else {
            var _data;

            var data = (_data = {}, _defineProperty(_data, valueKey, d.value), _defineProperty(_data, labelKey, d.label), _data);

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
        var valuesOrder = {};
        selectedValues.forEach(function (d, i) {
          valuesOrder[d] = i;
        });
        selectedOptions.sort(function (a, b) {
          return valuesOrder[a.value] - valuesOrder[b.value];
        });
      }

      return this.multiple || fullDetails ? selectedOptions : selectedOptions[0];
    }
  }, {
    key: "getVisibleOptionGroupsMapping",
    value: function getVisibleOptionGroupsMapping(searchValue) {
      var options = this.options;
      var result = {};
      var isOptionVisible = this.isOptionVisible.bind(this);
      options = this.structureOptionGroup(options);
      options.forEach(function (d) {
        result[d.index] = d.options.some(function (e) {
          return isOptionVisible({
            data: e,
            searchValue: searchValue
          }).isVisible;
        });
      });
      return result;
    }
  }, {
    key: "getOptionsCount",
    value: function getOptionsCount(count) {
      if (this.showAsPopup) {
        var availableHeight = window.innerHeight * 80 / 100 - dropboxCloseButtonFullHeight;

        if (this.hasSearchContainer) {
          availableHeight -= searchHeight;
        }

        count = Math.floor(availableHeight / this.optionHeight);
      } else {
        count = parseInt(count);
      }

      return count;
    }
  }, {
    key: "getOptionsHeight",
    value: function getOptionsHeight() {
      return this.optionsCount * this.optionHeight + 'px';
    }
  }, {
    key: "getSibling",
    value: function getSibling($ele, direction) {
      var propName = direction === 'next' ? 'nextElementSibling' : 'previousElementSibling';

      do {
        if ($ele) {
          $ele = $ele[propName];
        }
      } while (DomUtils.hasClass($ele, 'disabled') || DomUtils.hasClass($ele, 'group-title'));

      return $ele;
    }
  }, {
    key: "getUniqueId",
    value: function getUniqueId() {
      var uniqueId = Utils.getRandomInt(10000);
      var isAlreadyUsed = document.querySelector("#vscomp-ele-wrapper-".concat(uniqueId));

      if (isAlreadyUsed) {
        return this.getUniqueId();
      } else {
        return uniqueId;
      }
    }
    /** get methods - end */

  }, {
    key: "initDropboxPopover",
    value: function initDropboxPopover() {
      var data = {
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
        afterHide: this.afterHidePopper.bind(this)
      };
      this.dropboxPopover = new PopoverComponent(data);
    }
  }, {
    key: "openDropbox",
    value: function openDropbox(isSilent) {
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
  }, {
    key: "afterShowPopper",
    value: function afterShowPopper() {
      var isSilent = this.isSilentOpen;
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
  }, {
    key: "closeDropbox",
    value: function closeDropbox(isSilent) {
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
  }, {
    key: "afterHidePopper",
    value: function afterHidePopper() {
      var isSilent = this.isSilentClose;
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
  }, {
    key: "moveSelectedOptionsFirst",
    value: function moveSelectedOptionsFirst() {
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
  }, {
    key: "toggleDropbox",
    value: function toggleDropbox() {
      if (this.isOpened()) {
        this.closeDropbox();
      } else {
        this.openDropbox();
      }
    }
  }, {
    key: "updatePosition",
    value: function updatePosition() {
      if (!this.dropboxPopover) {
        return;
      }

      this.$ele.updatePosition();
    }
  }, {
    key: "isOpened",
    value: function isOpened() {
      return !DomUtils.hasClass(this.$wrapper, 'closed');
    }
  }, {
    key: "focusSearchInput",
    value: function focusSearchInput() {
      var $ele = this.$searchInput;

      if ($ele) {
        $ele.focus();
      }
    }
  }, {
    key: "focusOption",
    value: function focusOption() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          direction = _ref4.direction,
          $option = _ref4.$option,
          focusFirst = _ref4.focusFirst;

      var $focusedEle = this.$dropboxContainer.querySelector('.vscomp-option.focused');
      var $newFocusedEle;

      if ($option) {
        $newFocusedEle = $option;
      } else if (!$focusedEle || focusFirst) {
        /* if no element on focus choose first visible one */
        var firstVisibleOptionIndex = this.getFirstVisibleOptionIndex();
        $newFocusedEle = this.$dropboxContainer.querySelector(".vscomp-option[data-visible-index=\"".concat(firstVisibleOptionIndex, "\"]"));

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
  }, {
    key: "moveFocusedOptionToView",
    value: function moveFocusedOptionToView($focusedEle) {
      if (!$focusedEle) {
        $focusedEle = this.$dropboxContainer.querySelector('.vscomp-option.focused');
      }

      if (!$focusedEle) {
        return;
      }

      var newScrollTop;
      var containerRect = this.$optionsContainer.getBoundingClientRect();
      var optionRect = $focusedEle.getBoundingClientRect();
      var containerTop = containerRect.top;
      var containerBottom = containerRect.bottom;
      var containerHeight = containerRect.height;
      var optionTop = optionRect.top;
      var optionBottom = optionRect.bottom;
      var optionHeight = optionRect.height;
      var optionOffsetTop = $focusedEle.offsetTop;
      var optionsTop = DomUtils.getData(this.$options, 'top', 'number');
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
  }, {
    key: "removeOptionFocus",
    value: function removeOptionFocus() {
      var $focusedEle = this.$dropboxContainer.querySelector('.vscomp-option.focused');

      if (!$focusedEle) {
        return;
      }

      this.toggleOptionFocusedState($focusedEle, false);
      this.toggleFocusedProp(null);
    }
  }, {
    key: "selectOption",
    value: function selectOption($ele) {
      var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          event = _ref5.event;

      if (!$ele) {
        return;
      }

      var isAdding = !DomUtils.hasClass($ele, 'selected');

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

      var selectedValues = this.selectedValues;
      var selectedValue = DomUtils.getData($ele, 'value');
      var selectedIndex = DomUtils.getData($ele, 'index', 'number');
      var shouldSelectRange = false;
      var lastSelectedOptionIndex = this.lastSelectedOptionIndex;
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
          var $prevSelectedOption = this.$dropboxContainer.querySelector('.vscomp-option.selected');

          if ($prevSelectedOption) {
            this.toggleOptionSelectedState($prevSelectedOption, false);
          }

          this.closeDropbox();
        }

        this.lastSelectedOptionIndex = selectedIndex;
        this.toggleOptionSelectedState($ele);
      } else {
        if (this.multiple) {
          this.toggleOptionSelectedState($ele);
          Utils.removeItemFromArray(selectedValues, selectedValue);
          this.toggleAllOptionsClass(false);
          this.toggleGroupOptionsParent($ele, false);
        }
      }

      if (DomUtils.hasClass($ele, 'current-new')) {
        this.beforeSelectNewValue();
      }

      this.setValue(selectedValues);

      if (shouldSelectRange) {
        this.selectRangeOptions(lastSelectedOptionIndex, selectedIndex);
      }
    }
  }, {
    key: "selectFocusedOption",
    value: function selectFocusedOption() {
      this.selectOption(this.$dropboxContainer.querySelector('.vscomp-option.focused'));
    }
  }, {
    key: "selectRangeOptions",
    value: function selectRangeOptions(lastSelectedOptionIndex, selectedIndex) {
      var _this7 = this;

      if (typeof lastSelectedOptionIndex !== 'number' || this.maxValues) {
        return;
      }

      var selectedValues = this.selectedValues,
          hasOptionGroup = this.hasOptionGroup;
      var groupIndexes = {};
      var startIndex;
      var endIndex;

      if (lastSelectedOptionIndex < selectedIndex) {
        startIndex = lastSelectedOptionIndex;
        endIndex = selectedIndex;
      } else {
        startIndex = selectedIndex;
        endIndex = lastSelectedOptionIndex;
      }

      this.options.forEach(function (d) {
        if (d.isDisabled || d.isGroupTitle || !d.isVisible || d.isSelected) {
          return;
        }

        var index = d.index;

        if (index > startIndex && index < endIndex) {
          if (hasOptionGroup) {
            var groupIndex = d.groupIndex;

            if (typeof groupIndex === 'number') {
              groupIndexes[groupIndex] = true;
            }
          } // eslint-disable-next-line no-param-reassign


          d.isSelected = true;
          selectedValues.push(d.value);
        }
      });
      this.toggleAllOptionsClass();
      this.setValue(selectedValues);
      groupIndexes = Object.keys(groupIndexes);

      if (groupIndexes.length) {
        var toggleGroupTitleProp = this.toggleGroupTitleProp.bind(this);
        groupIndexes.forEach(function (i) {
          toggleGroupTitleProp(parseInt(i));
        });
      }
      /** using setTimeout to fix the issue of dropbox getting closed on select */


      setTimeout(function () {
        _this7.renderOptions();
      }, 0);
    }
  }, {
    key: "toggleAllOptions",
    value: function toggleAllOptions(isSelected) {
      if (!this.multiple || this.disableSelectAll) {
        return;
      }

      if (typeof isSelected !== 'boolean') {
        isSelected = !DomUtils.hasClass(this.$toggleAllCheckbox, 'checked');
      }

      var selectedValues = [];
      var selectAllOnlyVisible = this.selectAllOnlyVisible;
      this.options.forEach(function (d) {
        if (d.isDisabled || d.isCurrentNew) {
          return;
        }

        if (!isSelected || selectAllOnlyVisible && !d.isVisible) {
          // eslint-disable-next-line no-param-reassign
          d.isSelected = false;
        } else {
          // eslint-disable-next-line no-param-reassign
          d.isSelected = true;

          if (!d.isGroupTitle) {
            selectedValues.push(d.value);
          }
        }
      });
      this.toggleAllOptionsClass(isSelected);
      this.setValue(selectedValues);
      this.renderOptions();
    }
  }, {
    key: "toggleAllOptionsClass",
    value: function toggleAllOptionsClass(isAllSelected) {
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
  }, {
    key: "isAllOptionsSelected",
    value: function isAllOptionsSelected() {
      var isAllSelected = false;

      if (this.options.length && this.selectedValues.length) {
        isAllSelected = !this.options.some(function (d) {
          return !d.isSelected && !d.isDisabled && !d.isGroupTitle;
        });
      }

      return isAllSelected;
    }
  }, {
    key: "isAllGroupOptionsSelected",
    value: function isAllGroupOptionsSelected(groupIndex) {
      var isAllSelected = false;

      if (this.options.length) {
        isAllSelected = !this.options.some(function (d) {
          return !d.isSelected && !d.isDisabled && !d.isGroupTitle && d.groupIndex === groupIndex;
        });
      }

      return isAllSelected;
    }
  }, {
    key: "toggleGroupOptionsParent",
    value: function toggleGroupOptionsParent($option, isSelected) {
      if (!this.hasOptionGroup || this.disableOptionGroupCheckbox || !$option) {
        return;
      }

      var groupIndex = DomUtils.getData($option, 'groupIndex', 'number');
      var $group = this.$options.querySelector(".vscomp-option[data-index=\"".concat(groupIndex, "\"]"));
      var isAllSelected = typeof isSelected === 'boolean' ? isSelected : this.isAllGroupOptionsSelected(groupIndex);
      this.toggleGroupTitleCheckbox($group, isAllSelected);
    }
  }, {
    key: "toggleGroupTitleProp",
    value: function toggleGroupTitleProp(groupIndex, isSelected) {
      var isAllSelected = typeof isSelected === 'boolean' ? isSelected : this.isAllGroupOptionsSelected(groupIndex);
      this.toggleSelectedProp(groupIndex, isAllSelected);
    }
  }, {
    key: "toggleGroupOptions",
    value: function toggleGroupOptions($ele, isSelected) {
      var _this8 = this;

      if (!this.hasOptionGroup || this.disableOptionGroupCheckbox || !$ele) {
        return;
      }

      var groupIndex = DomUtils.getData($ele, 'index', 'number');
      var selectedValues = this.selectedValues,
          selectAllOnlyVisible = this.selectAllOnlyVisible;
      var valuesMapping = {};
      var removeItemFromArray = Utils.removeItemFromArray;
      selectedValues.forEach(function (d) {
        valuesMapping[d] = true;
      });
      this.options.forEach(function (d) {
        if (d.isDisabled || d.groupIndex !== groupIndex) {
          return;
        }

        var value = d.value;

        if (!isSelected || selectAllOnlyVisible && !d.isVisible) {
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

      setTimeout(function () {
        _this8.renderOptions();
      }, 0);
    }
  }, {
    key: "toggleGroupTitleCheckbox",
    value: function toggleGroupTitleCheckbox($ele, isSelected) {
      if (!$ele) {
        return;
      }

      var selectedIndex = DomUtils.getData($ele, 'index', 'number');
      this.toggleSelectedProp(selectedIndex, isSelected);
      this.toggleOptionSelectedState($ele, isSelected);
    }
  }, {
    key: "toggleFocusedProp",
    value: function toggleFocusedProp(index) {
      var isFocused = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.focusedOptionIndex) {
        this.setOptionProp(this.focusedOptionIndex, 'isFocused', false);
      }

      this.setOptionProp(index, 'isFocused', isFocused);
      this.focusedOptionIndex = index;
    }
  }, {
    key: "toggleSelectedProp",
    value: function toggleSelectedProp(index) {
      var isSelected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.setOptionProp(index, 'isSelected', isSelected);
    }
  }, {
    key: "scrollToTop",
    value: function scrollToTop() {
      var isClosed = !this.isOpened();

      if (isClosed) {
        this.openDropbox(true);
      }

      var scrollTop = this.$optionsContainer.scrollTop;

      if (scrollTop > 0) {
        this.$optionsContainer.scrollTop = 0;
      }

      if (isClosed) {
        this.closeDropbox(true);
      }
    }
  }, {
    key: "reset",
    value: function reset() {
      var formReset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      this.options.forEach(function (d) {
        // eslint-disable-next-line no-param-reassign
        d.isSelected = false;
      });
      this.beforeValueSet(true);
      this.setValue(null, {
        disableValidation: formReset
      });
      this.afterValueSet();

      if (formReset) {
        DomUtils.removeClass(this.$allWrappers, 'has-error');
      }

      DomUtils.dispatchEvent(this.$ele, 'reset');
    }
  }, {
    key: "addOption",
    value: function addOption(data, rerender) {
      if (!data) {
        return;
      }

      this.lastOptionIndex++;
      data.index = this.lastOptionIndex;
      var newOption = this.getOptionObj(data);
      this.options.push(newOption);
      this.sortedOptions.push(newOption);

      if (rerender) {
        this.visibleOptionsCount++;
        this.afterSetOptions();
      }
    }
  }, {
    key: "removeOption",
    value: function removeOption(index) {
      if (!index && index != 0) {
        return;
      }

      this.options.splice(index, 1);
      this.lastOptionIndex--;
    }
  }, {
    key: "removeNewOption",
    value: function removeNewOption() {
      var newOption = this.getNewOption();

      if (newOption) {
        this.removeOption(newOption.index);
      }
    }
  }, {
    key: "sortOptions",
    value: function sortOptions(options) {
      return options.sort(function (a, b) {
        var aIsSelected = a.isSelected || a.isAnySelected;
        var bIsSelected = b.isSelected || b.isAnySelected;

        if (!aIsSelected && !bIsSelected) {
          return 0;
        } else if (aIsSelected && (!bIsSelected || a.index < b.index)) {
          return -1;
        } else {
          return 1;
        }
      });
    }
  }, {
    key: "sortOptionsGroup",
    value: function sortOptionsGroup(options) {
      var sortOptions = this.sortOptions.bind(this);
      options = this.structureOptionGroup(options);
      options.forEach(function (d) {
        var childOptions = d.options; // eslint-disable-next-line no-param-reassign

        d.isAnySelected = childOptions.some(function (e) {
          return e.isSelected;
        });

        if (d.isAnySelected) {
          sortOptions(childOptions);
        }
      });
      sortOptions(options);
      return this.destructureOptionGroup(options);
    }
  }, {
    key: "isOptionVisible",
    value: function isOptionVisible(_ref6) {
      var data = _ref6.data,
          searchValue = _ref6.searchValue,
          hasExactOption = _ref6.hasExactOption,
          visibleOptionGroupsMapping = _ref6.visibleOptionGroupsMapping,
          searchGroup = _ref6.searchGroup;
      var value = data.value.toLowerCase();
      var label = data.label.toLowerCase();
      var description = data.description,
          alias = data.alias;
      var isVisible = label.indexOf(searchValue) !== -1;

      if (data.isGroupTitle) {
        if (!searchGroup || !isVisible) {
          isVisible = visibleOptionGroupsMapping[data.index];
        }
      }

      if (alias && !isVisible) {
        isVisible = alias.indexOf(searchValue) !== -1;
      }

      if (description && !isVisible) {
        isVisible = description.toLowerCase().indexOf(searchValue) !== -1;
      }

      data.isVisible = isVisible;

      if (!hasExactOption) {
        hasExactOption = label === searchValue || value === searchValue;
      }

      return {
        isVisible: isVisible,
        hasExactOption: hasExactOption
      };
    }
  }, {
    key: "structureOptionGroup",
    value: function structureOptionGroup(options) {
      var result = [];
      var childOptions = {};
      /** getting all group title */

      options.forEach(function (d) {
        if (d.isGroupTitle) {
          var childArray = []; // eslint-disable-next-line no-param-reassign

          d.options = childArray;
          childOptions[d.index] = childArray;
          result.push(d);
        }
      });
      /** getting all group options */

      options.forEach(function (d) {
        if (d.isGroupOption) {
          childOptions[d.groupIndex].push(d);
        }
      });
      return result;
    }
  }, {
    key: "destructureOptionGroup",
    value: function destructureOptionGroup(options) {
      var result = [];
      options.forEach(function (d) {
        result.push(d);
        result = result.concat(d.options);
      });
      return result;
    }
  }, {
    key: "serverSearch",
    value: function serverSearch() {
      DomUtils.removeClass(this.$allWrappers, 'has-no-search-results');
      DomUtils.addClass(this.$allWrappers, 'server-searching');
      this.setSelectedOptions();
      this.onServerSearch(this.searchValue, this);
    }
  }, {
    key: "removeValue",
    value: function removeValue($ele) {
      var selectedValues = this.selectedValues;
      var selectedValue = DomUtils.getData($ele, 'value');
      Utils.removeItemFromArray(selectedValues, selectedValue);
      this.setValueMethod(selectedValues);
    }
  }, {
    key: "focus",
    value: function focus() {
      this.$wrapper.focus();
    }
  }, {
    key: "enable",
    value: function enable() {
      this.$ele.disabled = false;
      this.$ele.removeAttribute('disabled');
      this.$hiddenInput.removeAttribute('disabled');
      DomUtils.setAria(this.$wrapper, 'disabled', false);
    }
  }, {
    key: "disable",
    value: function disable() {
      this.$ele.disabled = true;
      this.$ele.setAttribute('disabled', '');
      this.$hiddenInput.setAttribute('disabled', '');
      DomUtils.setAria(this.$wrapper, 'disabled', true);
    }
  }, {
    key: "validate",
    value: function validate() {
      if (this.disableValidation) {
        return true;
      }

      var hasError = false;

      if (this.required && Utils.isEmpty(this.selectedValues)) {
        hasError = true;
      }

      DomUtils.toggleClass(this.$allWrappers, 'has-error', hasError);
      return !hasError;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var $ele = this.$ele;
      $ele.virtualSelect = undefined;
      $ele.value = undefined;
      $ele.innerHTML = '';

      if (this.hasDropboxWrapper) {
        this.$dropboxWrapper.remove();
        this.mutationObserver.disconnect();
      }

      DomUtils.removeClass($ele, 'vscomp-ele');
    }
  }, {
    key: "createSecureTextElements",
    value: function createSecureTextElements() {
      this.$secureDiv = document.createElement('div');
      this.$secureText = document.createTextNode('');
      this.$secureDiv.appendChild(this.$secureText);
    }
  }, {
    key: "secureText",
    value: function secureText(text) {
      if (!text || !this.enableSecureText) {
        return text;
      }

      this.$secureText.nodeValue = text;
      return this.$secureDiv.innerHTML;
    }
  }, {
    key: "toggleRequired",
    value: function toggleRequired(isRequired) {
      this.required = Utils.convertToBoolean(isRequired);
      this.$ele.required = this.required;
    }
  }, {
    key: "toggleOptionSelectedState",
    value: function toggleOptionSelectedState($ele, value) {
      var isSelected = value;

      if (typeof isSelected === 'undefined') {
        isSelected = !DomUtils.hasClass($ele, 'selected');
      }

      DomUtils.toggleClass($ele, 'selected', isSelected);
      DomUtils.setAria($ele, 'selected', isSelected);
    }
  }, {
    key: "toggleOptionFocusedState",
    value: function toggleOptionFocusedState($ele, isFocused) {
      if (!$ele) {
        return;
      }

      DomUtils.toggleClass($ele, 'focused', isFocused);

      if (isFocused) {
        DomUtils.setAria(this.$wrapper, 'activedescendant', $ele.id);
      }
    }
    /** static methods - start */

  }], [{
    key: "init",
    value: function init(options) {
      var $eleArray = options.ele;

      if (!$eleArray) {
        return;
      }

      var singleEle = false;

      if (typeof $eleArray === 'string') {
        $eleArray = document.querySelectorAll($eleArray);
        var eleLength = $eleArray.length;

        if (eleLength === 0) {
          return;
        } else if (eleLength === 1) {
          singleEle = true;
        }
      }

      if ($eleArray.length === undefined || $eleArray.forEach === undefined) {
        $eleArray = [$eleArray];
        singleEle = true;
      }

      var instances = [];
      $eleArray.forEach(function ($ele) {
        /** skipping initialization on calling init method multiple times */
        if ($ele.virtualSelect) {
          instances.push($ele.virtualSelect);
          return;
        }

        options.ele = $ele;

        if ($ele.tagName === 'SELECT') {
          VirtualSelect.setPropsFromSelect(options);
        }

        instances.push(new VirtualSelect(options));
      });
      return singleEle ? instances[0] : instances;
    }
  }, {
    key: "getAttrProps",
    value: function getAttrProps() {
      var convertPropToDataAttr = DomUtils.convertPropToDataAttr;
      var result = {};
      nativeProps.forEach(function (d) {
        result[d] = d;
      });
      dataProps.forEach(function (d) {
        result[convertPropToDataAttr(d)] = d;
      });
      return result;
    }
  }, {
    key: "setPropsFromSelect",
    value: function setPropsFromSelect(props) {
      var $ele = props.ele;
      var disabledOptions = [];
      var selectedValue = [];

      var getNativeOptions = function getNativeOptions($container) {
        var options = [];
        var $options = Array.from($container.children);
        $options.forEach(function ($option) {
          var value = $option.value;
          var option = {
            value: value
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

      var optionsList = getNativeOptions($ele);
      /** creating div element to initiate plugin and removing native element */

      var $newEle = document.createElement('div');
      DomUtils.setAttrFromEle($ele, $newEle, Object.keys(attrPropsMapping), valueLessProps);
      $ele.parentNode.insertBefore($newEle, $ele);
      $ele.remove();
      props.ele = $newEle;
      props.options = optionsList;
      props.disabledOptions = disabledOptions;
      props.selectedValue = selectedValue;
    }
  }, {
    key: "onFormReset",
    value: function onFormReset(e) {
      var $form = e.target.closest('form');

      if (!$form) {
        return;
      }

      $form.querySelectorAll('.vscomp-ele-wrapper').forEach(function ($ele) {
        $ele.parentElement.virtualSelect.reset(true);
      });
    }
  }, {
    key: "onFormSubmit",
    value: function onFormSubmit(e) {
      if (!VirtualSelect.validate(e.target.closest('form'))) {
        e.preventDefault();
      }
    }
  }, {
    key: "validate",
    value: function validate($container) {
      if (!$container) {
        return true;
      }

      var hasError = false;
      $container.querySelectorAll('.vscomp-ele-wrapper').forEach(function ($ele) {
        var result = $ele.parentElement.virtualSelect.validate();

        if (!hasError && !result) {
          hasError = true;
        }
      });
      return !hasError;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.virtualSelect.reset();
    }
  }, {
    key: "setValueMethod",
    value: function setValueMethod() {
      var _this$virtualSelect;

      (_this$virtualSelect = this.virtualSelect).setValueMethod.apply(_this$virtualSelect, arguments);
    }
  }, {
    key: "setOptionsMethod",
    value: function setOptionsMethod() {
      var _this$virtualSelect2;

      (_this$virtualSelect2 = this.virtualSelect).setOptionsMethod.apply(_this$virtualSelect2, arguments);
    }
  }, {
    key: "setDisabledOptionsMethod",
    value: function setDisabledOptionsMethod() {
      var _this$virtualSelect3;

      (_this$virtualSelect3 = this.virtualSelect).setDisabledOptionsMethod.apply(_this$virtualSelect3, arguments);
    }
  }, {
    key: "toggleSelectAll",
    value: function toggleSelectAll(isSelected) {
      this.virtualSelect.toggleAllOptions(isSelected);
    }
  }, {
    key: "isAllSelected",
    value: function isAllSelected() {
      return this.virtualSelect.isAllSelected;
    }
  }, {
    key: "addOptionMethod",
    value: function addOptionMethod(data) {
      this.virtualSelect.addOption(data, true);
    }
  }, {
    key: "getNewValueMethod",
    value: function getNewValueMethod() {
      return this.virtualSelect.getNewValue();
    }
  }, {
    key: "getDisplayValueMethod",
    value: function getDisplayValueMethod() {
      return this.virtualSelect.getDisplayValue();
    }
  }, {
    key: "getSelectedOptionsMethod",
    value: function getSelectedOptionsMethod(params) {
      return this.virtualSelect.getSelectedOptions(params);
    }
  }, {
    key: "openMethod",
    value: function openMethod() {
      return this.virtualSelect.openDropbox();
    }
  }, {
    key: "closeMethod",
    value: function closeMethod() {
      return this.virtualSelect.closeDropbox();
    }
  }, {
    key: "focusMethod",
    value: function focusMethod() {
      return this.virtualSelect.focus();
    }
  }, {
    key: "enableMethod",
    value: function enableMethod() {
      return this.virtualSelect.enable();
    }
  }, {
    key: "disableMethod",
    value: function disableMethod() {
      return this.virtualSelect.disable();
    }
  }, {
    key: "destroyMethod",
    value: function destroyMethod() {
      return this.virtualSelect.destroy();
    }
  }, {
    key: "validateMethod",
    value: function validateMethod() {
      return this.virtualSelect.validate();
    }
  }, {
    key: "toggleRequiredMethod",
    value: function toggleRequiredMethod(isRequired) {
      return this.virtualSelect.toggleRequired(isRequired);
    }
  }, {
    key: "onResizeMethod",
    value: function onResizeMethod() {
      document.querySelectorAll('.vscomp-ele-wrapper').forEach(function ($ele) {
        $ele.parentElement.virtualSelect.onResize();
      });
    }
    /** static methods - end */

  }]);

  return VirtualSelect;
}();
document.addEventListener('reset', VirtualSelect.onFormReset);
document.addEventListener('submit', VirtualSelect.onFormSubmit);
window.addEventListener('resize', VirtualSelect.onResizeMethod);
var attrPropsMapping = VirtualSelect.getAttrProps();
window.VirtualSelect = VirtualSelect;
/** polyfill to fix an issue in ie browser */

if (typeof NodeList !== 'undefined' && NodeList.prototype && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}
}();
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
!function() {
/*!
 * Popover v1.0.7
 * https://sa-si-dev.github.io/popover
 * Licensed under MIT (https://github.com/sa-si-dev/popover/blob/master/LICENSE)
 */!function(){"use strict";function e(e){return function(e){if(Array.isArray(e))return t(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,o){if(e){if("string"==typeof e)return t(e,o);var i=Object.prototype.toString.call(e).slice(8,-1);return"Object"===i&&e.constructor&&(i=e.constructor.name),"Map"===i||"Set"===i?Array.from(e):"Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)?t(e,o):void 0}}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function t(e,t){(null==t||t>e.length)&&(t=e.length);for(var o=0,i=new Array(t);o<t;o++)i[o]=e[o];return i}function o(e,t){for(var o=0;o<t.length;o++){var i=t[o];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var i=function(){function t(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t)}var i,n;return i=t,(n=[{key:"addClass",value:function(o,i){o&&(i=i.split(" "),t.getElements(o).forEach((function(t){var o;(o=t.classList).add.apply(o,e(i))})))}},{key:"removeClass",value:function(o,i){o&&(i=i.split(" "),t.getElements(o).forEach((function(t){var o;(o=t.classList).remove.apply(o,e(i))})))}},{key:"getElements",value:function(e){if(e)return void 0===e.forEach&&(e=[e]),e}},{key:"getMoreVisibleSides",value:function(e){if(!e)return{};var t=e.getBoundingClientRect(),o=window.innerWidth,i=window.innerHeight,n=t.left,r=t.top;return{horizontal:n>o-n-t.width?"left":"right",vertical:r>i-r-t.height?"top":"bottom"}}},{key:"getAbsoluteCoords",value:function(e){if(e){var t=e.getBoundingClientRect(),o=window.pageXOffset,i=window.pageYOffset;return{width:t.width,height:t.height,top:t.top+i,right:t.right+o,bottom:t.bottom+i,left:t.left+o}}}},{key:"getCoords",value:function(e){return e?e.getBoundingClientRect():{}}},{key:"getData",value:function(e,t,o){if(e){var i=e?e.dataset[t]:"";return"number"===o?i=parseFloat(i)||0:"true"===i?i=!0:"false"===i&&(i=!1),i}}},{key:"setData",value:function(e,t,o){e&&(e.dataset[t]=o)}},{key:"setStyle",value:function(e,t,o){e&&(e.style[t]=o)}},{key:"show",value:function(e){var o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"block";t.setStyle(e,"display",o)}},{key:"hide",value:function(e){t.setStyle(e,"display","none")}},{key:"getHideableParent",value:function(e){for(var t,o=e.parentElement;o;){var i=getComputedStyle(o).overflow;if(-1!==i.indexOf("scroll")||-1!==i.indexOf("auto")){t=o;break}o=o.parentElement}return t}}])&&o(i,n),t}();function n(e,t){for(var o=0;o<t.length;o++){var i=t[o];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var r=["top","bottom","left","right"].map((function(e){return"position-".concat(e)})),a={top:"rotate(180deg)",left:"rotate(90deg)",right:"rotate(-90deg)"},s=function(){function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);try{this.setProps(t),this.init()}catch(e){console.warn("Couldn't initiate popper"),console.error(e)}}var t,o;return t=e,(o=[{key:"init",value:function(){var e=this.$popperEle;e&&this.$triggerEle&&(i.setStyle(e,"zIndex",this.zIndex),this.setPosition())}},{key:"setProps",value:function(e){var t=(e=this.setDefaultProps(e)).position?e.position.toLowerCase():"auto";if(this.$popperEle=e.$popperEle,this.$triggerEle=e.$triggerEle,this.$arrowEle=e.$arrowEle,this.margin=parseFloat(e.margin),this.offset=parseFloat(e.offset),this.enterDelay=parseFloat(e.enterDelay),this.exitDelay=parseFloat(e.exitDelay),this.showDuration=parseFloat(e.showDuration),this.hideDuration=parseFloat(e.hideDuration),this.transitionDistance=parseFloat(e.transitionDistance),this.zIndex=parseFloat(e.zIndex),this.afterShowCallback=e.afterShow,this.afterHideCallback=e.afterHide,this.hasArrow=!!this.$arrowEle,-1!==t.indexOf(" ")){var o=t.split(" ");this.position=o[0],this.secondaryPosition=o[1]}else this.position=t}},{key:"setDefaultProps",value:function(e){return Object.assign({position:"auto",margin:8,offset:5,enterDelay:0,exitDelay:0,showDuration:300,hideDuration:200,transitionDistance:10,zIndex:1},e)}},{key:"setPosition",value:function(){i.show(this.$popperEle,"inline-flex");var e,t,o,n=window.innerWidth,s=window.innerHeight,l=i.getAbsoluteCoords(this.$popperEle),p=i.getAbsoluteCoords(this.$triggerEle),h=l.width,u=l.height,c=l.top,f=l.right,d=l.bottom,v=l.left,y=p.width,m=p.height,g=p.top,w=p.right,E=p.bottom,b=p.left,k=g-c,$=b-v,D=$,C=k,S=this.position,P=this.secondaryPosition,O=y/2-h/2,A=m/2-u/2,x=this.margin,T=this.transitionDistance,H=window.scrollY-c,I=s+H,F=window.scrollX-v,M=n+F,L=this.offset;L&&(H+=L,I-=L,F+=L,M-=L),"auto"===S&&(S=i.getMoreVisibleSides(this.$triggerEle).vertical);var j={top:{top:C-u-x,left:D+O},bottom:{top:C+m+x,left:D+O},right:{top:C+A,left:D+y+x},left:{top:C+A,left:D-h-x}},z=j[S];if(C=z.top,D=z.left,P&&("top"===P?C=k:"bottom"===P?C=k+m-u:"left"===P?D=$:"right"===P&&(D=$+y-h)),D<F?"left"===S?o="right":D=F+v>w?w-v:F:D+h>M&&("right"===S?o="left":D=M+v<b?b-f:M-h),C<H?"top"===S?o="bottom":C=H+c>E?E-c:H:C+u>I&&("bottom"===S?o="top":C=I+c<g?g-d:I-u),o){var R=j[o];"top"===(S=o)||"bottom"===S?C=R.top:"left"!==S&&"right"!==S||(D=R.left)}"top"===S?(e=C+T,t=D):"right"===S?(e=C,t=D-T):"left"===S?(e=C,t=D+T):(e=C-T,t=D);var U="translate3d(".concat(t,"px, ").concat(e,"px, 0)");if(i.setStyle(this.$popperEle,"transform",U),i.setData(this.$popperEle,"fromLeft",t),i.setData(this.$popperEle,"fromTop",e),i.setData(this.$popperEle,"top",C),i.setData(this.$popperEle,"left",D),i.removeClass(this.$popperEle,r.join(" ")),i.addClass(this.$popperEle,"position-".concat(S)),this.hasArrow){var B=0,q=0,W=D+v,K=C+c,V=this.$arrowEle.offsetWidth/2,X=a[S]||"";"top"===S||"bottom"===S?(B=y/2+b-W)<V?B=V:B>h-V&&(B=h-V):"left"!==S&&"right"!==S||((q=m/2+g-K)<V?q=V:q>u-V&&(q=u-V)),i.setStyle(this.$arrowEle,"transform","translate3d(".concat(B,"px, ").concat(q,"px, 0) ").concat(X))}i.hide(this.$popperEle)}},{key:"resetPosition",value:function(){i.setStyle(this.$popperEle,"transform","none"),this.setPosition()}},{key:"show",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},o=t.resetPosition,n=t.data;clearTimeout(this.exitDelayTimeout),clearTimeout(this.hideDurationTimeout),o&&this.resetPosition(),this.enterDelayTimeout=setTimeout((function(){var t=i.getData(e.$popperEle,"left"),o=i.getData(e.$popperEle,"top"),r="translate3d(".concat(t,"px, ").concat(o,"px, 0)"),a=e.showDuration;i.show(e.$popperEle,"inline-flex"),i.getCoords(e.$popperEle),i.setStyle(e.$popperEle,"transitionDuration",a+"ms"),i.setStyle(e.$popperEle,"transform",r),i.setStyle(e.$popperEle,"opacity",1),e.showDurationTimeout=setTimeout((function(){"function"==typeof e.afterShowCallback&&e.afterShowCallback(n)}),a)}),this.enterDelay)}},{key:"hide",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},o=t.data;clearTimeout(this.enterDelayTimeout),clearTimeout(this.showDurationTimeout),this.exitDelayTimeout=setTimeout((function(){if(e.$popperEle){var t=i.getData(e.$popperEle,"fromLeft"),n=i.getData(e.$popperEle,"fromTop"),r="translate3d(".concat(t,"px, ").concat(n,"px, 0)"),a=e.hideDuration;i.setStyle(e.$popperEle,"transitionDuration",a+"ms"),i.setStyle(e.$popperEle,"transform",r),i.setStyle(e.$popperEle,"opacity",0),e.hideDurationTimeout=setTimeout((function(){i.hide(e.$popperEle),"function"==typeof e.afterHideCallback&&e.afterHideCallback(o)}),a)}}),this.exitDelay)}},{key:"updatePosition",value:function(){i.setStyle(this.$popperEle,"transitionDuration","0ms"),this.resetPosition();var e=i.getData(this.$popperEle,"left"),t=i.getData(this.$popperEle,"top");i.show(this.$popperEle,"inline-flex"),i.setStyle(this.$popperEle,"transform","translate3d(".concat(e,"px, ").concat(t,"px, 0)"))}}])&&n(t.prototype,o),e}();window.PopperComponent=s}(),function(){"use strict";function e(e,t){for(var o=0;o<t.length;o++){var i=t[o];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var t=function(){function t(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t)}var o,i,n;return o=t,n=[{key:"convertToBoolean",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return e=!0===e||"true"===e||!1!==e&&"false"!==e&&t}},{key:"removeArrayEmpty",value:function(e){return Array.isArray(e)&&e.length?e.filter((function(e){return!!e})):[]}},{key:"throttle",value:function(e,t){var o,i=0;return function(){for(var n=arguments.length,r=new Array(n),a=0;a<n;a++)r[a]=arguments[a];var s=(new Date).getTime(),l=t-(s-i);clearTimeout(o),l<=0?(i=s,e.apply(void 0,r)):o=setTimeout((function(){e.apply(void 0,r)}),l)}}}],(i=null)&&e(o.prototype,i),n&&e(o,n),t}();function o(e){return function(e){if(Array.isArray(e))return i(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,t){if(e){if("string"==typeof e)return i(e,t);var o=Object.prototype.toString.call(e).slice(8,-1);return"Object"===o&&e.constructor&&(o=e.constructor.name),"Map"===o||"Set"===o?Array.from(e):"Arguments"===o||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)?i(e,t):void 0}}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function i(e,t){(null==t||t>e.length)&&(t=e.length);for(var o=0,i=new Array(t);o<t;o++)i[o]=e[o];return i}function n(e,t){for(var o=0;o<t.length;o++){var i=t[o];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var r=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e)}var i,r,a;return i=e,a=[{key:"addClass",value:function(t,i){t&&(i=i.split(" "),e.getElements(t).forEach((function(e){var t;(t=e.classList).add.apply(t,o(i))})))}},{key:"removeClass",value:function(t,i){t&&(i=i.split(" "),e.getElements(t).forEach((function(e){var t;(t=e.classList).remove.apply(t,o(i))})))}},{key:"hasClass",value:function(e,t){return!!e&&e.classList.contains(t)}},{key:"getElement",value:function(e){return e&&("string"==typeof e?e=document.querySelector(e):void 0!==e.length&&(e=e[0])),e||null}},{key:"getElements",value:function(e){if(e)return void 0===e.forEach&&(e=[e]),e}},{key:"addEvent",value:function(t,o,i){e.addOrRemoveEvent(t,o,i,"add")}},{key:"removeEvent",value:function(t,o,i){e.addOrRemoveEvent(t,o,i,"remove")}},{key:"addOrRemoveEvent",value:function(o,i,n,r){o&&(i=t.removeArrayEmpty(i.split(" "))).forEach((function(t){(o=e.getElements(o)).forEach((function(e){"add"===r?e.addEventListener(t,n):e.removeEventListener(t,n)}))}))}},{key:"getScrollableParents",value:function(e){if(!e)return[];for(var t=[window],o=e.parentElement;o;){var i=getComputedStyle(o).overflow;-1===i.indexOf("scroll")&&-1===i.indexOf("auto")||t.push(o),o=o.parentElement}return t}}],(r=null)&&n(i.prototype,r),a&&n(i,a),e}();function a(e,t){for(var o=0;o<t.length;o++){var i=t[o];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var s={27:"onEscPress"},l=function(){function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);try{this.setProps(t),this.init()}catch(e){console.warn("Couldn't initiate Popover component"),console.error(e)}}var o,i,n;return o=e,n=[{key:"init",value:function(t){var o=t.ele;if(o){var i=!1;if("string"==typeof o){if(!(o=document.querySelectorAll(o)))return;1===o.length&&(i=!0)}void 0===o.length&&(o=[o],i=!0);var n=[];return o.forEach((function(o){t.ele=o,e.destory(o),n.push(new e(t))})),i?n[0]:n}}},{key:"destory",value:function(e){if(e){var t=e.popComp;t&&t.destory()}}},{key:"showMethod",value:function(){this.popComp.show()}},{key:"hideMethod",value:function(){this.popComp.hide()}},{key:"updatePositionMethod",value:function(){this.popComp.popper.updatePosition()}}],(i=[{key:"init",value:function(){this.$popover&&(this.setElementProps(),this.renderArrow(),this.initPopper(),this.addEvents())}},{key:"getEvents",value:function(){var e=[{$ele:document,event:"click",method:"onDocumentClick"},{$ele:document,event:"keydown",method:"onDocumentKeyDown"}];return this.disableManualAction||(e.push({$ele:this.$ele,event:"click",method:"onTriggerEleClick"}),this.showOnHover&&(e.push({$ele:this.$ele,event:"mouseenter",method:"onTriggerEleMouseEnter"}),e.push({$ele:this.$ele,event:"mouseleave",method:"onTriggerEleMouseLeave"}))),e}},{key:"addOrRemoveEvents",value:function(e){var t=this;this.getEvents().forEach((function(o){t.addOrRemoveEvent({action:e,$ele:o.$ele,events:o.event,method:o.method})}))}},{key:"addEvents",value:function(){this.addOrRemoveEvents("add")}},{key:"removeEvents",value:function(){this.addOrRemoveEvents("remove"),this.removeScrollEventListeners()}},{key:"addOrRemoveEvent",value:function(e){var o=this,i=e.action,n=e.$ele,a=e.events,s=e.method,l=e.throttle;n&&(a=t.removeArrayEmpty(a.split(" "))).forEach((function(e){var a="".concat(s,"-").concat(e),p=o.events[a];p||(p=o[s].bind(o),l&&(p=t.throttle(p,l)),o.events[a]=p),"add"===i?r.addEvent(n,e,p):r.removeEvent(n,e,p)}))}},{key:"addScrollEventListeners",value:function(){this.$scrollableElems=r.getScrollableParents(this.$ele),this.addOrRemoveEvent({action:"add",$ele:this.$scrollableElems,events:"scroll",method:"onAnyParentScroll",throttle:100})}},{key:"removeScrollEventListeners",value:function(){this.$scrollableElems&&(this.addOrRemoveEvent({action:"remove",$ele:this.$scrollableElems,events:"scroll",method:"onAnyParentScroll"}),this.$scrollableElems=null)}},{key:"onAnyParentScroll",value:function(){this.popper.updatePosition()}},{key:"onDocumentClick",value:function(e){var t=e.target,o=t.closest(".pop-comp-ele"),i=t.closest(".pop-comp-wrapper");this.hideOnOuterClick&&o!==this.$ele&&i!==this.$popover&&this.hide()}},{key:"onDocumentKeyDown",value:function(e){var t=e.which||e.keyCode,o=s[t];o&&this[o](e)}},{key:"onEscPress",value:function(){this.hideOnOuterClick&&this.hide()}},{key:"onTriggerEleClick",value:function(){this.toggle()}},{key:"onTriggerEleMouseEnter",value:function(){this.show()}},{key:"onTriggerEleMouseLeave",value:function(){this.hide()}},{key:"setProps",value:function(e){e=this.setDefaultProps(e),this.setPropsFromElementAttr(e);var o=t.convertToBoolean;this.$ele=e.ele,this.target=e.target,this.position=e.position,this.margin=parseFloat(e.margin),this.offset=parseFloat(e.offset),this.enterDelay=parseFloat(e.enterDelay),this.exitDelay=parseFloat(e.exitDelay),this.showDuration=parseFloat(e.showDuration),this.hideDuration=parseFloat(e.hideDuration),this.transitionDistance=parseFloat(e.transitionDistance),this.zIndex=parseFloat(e.zIndex),this.hideOnOuterClick=o(e.hideOnOuterClick),this.showOnHover=o(e.showOnHover),this.hideArrowIcon=o(e.hideArrowIcon),this.disableManualAction=o(e.disableManualAction),this.disableUpdatePosition=o(e.disableUpdatePosition),this.beforeShowCallback=e.beforeShow,this.afterShowCallback=e.afterShow,this.beforeHideCallback=e.beforeHide,this.afterHideCallback=e.afterHide,this.events={},this.$popover=r.getElement(this.target)}},{key:"setDefaultProps",value:function(e){return Object.assign({position:"auto",margin:8,offset:5,enterDelay:0,exitDelay:0,showDuration:300,hideDuration:200,transitionDistance:10,zIndex:1,hideOnOuterClick:!0,showOnHover:!1,hideArrowIcon:!1,disableManualAction:!1,disableUpdatePosition:!1},e)}},{key:"setPropsFromElementAttr",value:function(e){var t=e.ele,o={"data-popover-target":"target","data-popover-position":"position","data-popover-margin":"margin","data-popover-offset":"offset","data-popover-enter-delay":"enterDelay","data-popover-exit-delay":"exitDelay","data-popover-show-duration":"showDuration","data-popover-hide-duration":"hideDuration","data-popover-transition-distance":"transitionDistance","data-popover-z-index":"zIndex","data-popover-hide-on-outer-click":"hideOnOuterClick","data-popover-show-on-hover":"showOnHover","data-popover-hide-arrow-icon":"hideArrowIcon","data-popover-disable-manual-action":"disableManualAction","data-popover-disable-update-position":"disableUpdatePosition"};for(var i in o){var n=t.getAttribute(i);n&&(e[o[i]]=n)}}},{key:"setElementProps",value:function(){var t=this.$ele;t.popComp=this,t.show=e.showMethod,t.hide=e.hideMethod,t.updatePosition=e.updatePositionMethod,r.addClass(this.$ele,"pop-comp-ele"),r.addClass(this.$popover,"pop-comp-wrapper")}},{key:"getOtherTriggerPopComp",value:function(){var e,t=this.$popover.popComp;return t&&t.$ele!==this.$ele&&(e=t),e}},{key:"initPopper",value:function(){var e={$popperEle:this.$popover,$triggerEle:this.$ele,$arrowEle:this.$arrowEle,position:this.position,margin:this.margin,offset:this.offset,enterDelay:this.enterDelay,exitDelay:this.exitDelay,showDuration:this.showDuration,hideDuration:this.hideDuration,transitionDistance:this.transitionDistance,zIndex:this.zIndex,afterShow:this.afterShow.bind(this),afterHide:this.afterHide.bind(this)};this.popper=new PopperComponent(e)}},{key:"beforeShow",value:function(){"function"==typeof this.beforeShowCallback&&this.beforeShowCallback(this)}},{key:"beforeHide",value:function(){"function"==typeof this.beforeHideCallback&&this.beforeHideCallback(this)}},{key:"show",value:function(){this.isShown()||(this.isShownForOtherTrigger()?this.showAfterOtherHide():(r.addClass(this.$popover,"pop-comp-disable-events"),this.$popover.popComp=this,this.beforeShow(),this.popper.show({resetPosition:!0}),r.addClass(this.$ele,"pop-comp-active")))}},{key:"hide",value:function(){this.isShown()&&(this.beforeHide(),this.popper.hide(),this.removeScrollEventListeners())}},{key:"toggle",value:function(e){void 0===e&&(e=!this.isShown()),e?this.show():this.hide()}},{key:"isShown",value:function(){return r.hasClass(this.$ele,"pop-comp-active")}},{key:"isShownForOtherTrigger",value:function(){var e=this.getOtherTriggerPopComp();return!!e&&e.isShown()}},{key:"showAfterOtherHide",value:function(){var e=this,t=this.getOtherTriggerPopComp();if(t){var o=t.exitDelay+t.hideDuration+100;setTimeout((function(){e.show()}),o)}}},{key:"afterShow",value:function(){var e=this;this.showOnHover?setTimeout((function(){r.removeClass(e.$popover,"pop-comp-disable-events")}),2e3):r.removeClass(this.$popover,"pop-comp-disable-events"),this.disableUpdatePosition||this.addScrollEventListeners(),"function"==typeof this.afterShowCallback&&this.afterShowCallback(this)}},{key:"afterHide",value:function(){r.removeClass(this.$ele,"pop-comp-active"),"function"==typeof this.afterHideCallback&&this.afterHideCallback(this)}},{key:"renderArrow",value:function(){if(!this.hideArrowIcon){var e=this.$popover.querySelector(".pop-comp-arrow");e||(this.$popover.insertAdjacentHTML("afterbegin",'<i class="pop-comp-arrow"></i>'),e=this.$popover.querySelector(".pop-comp-arrow")),this.$arrowEle=e}}},{key:"destory",value:function(){this.removeEvents()}}])&&a(o.prototype,i),n&&a(o,n),e}();window.PopoverComponent=l}();
}();
/******/ })()
;