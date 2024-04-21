export class Utils {
  /**
   * @param {any} text
   * @returns {string}
   * @memberof Utils
   */
  static getString(text) {
    return text || text === 0 ? text.toString() : '';
  }

  /**
   * @param {any} value
   * @param {boolean} defaultValue
   * @returns {boolean}
   * @memberof Utils
   */
  static convertToBoolean(value, defaultValue = false) {
    let result;

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
   * @memberof Utils
   */
  static isEmpty(value) {
    let result = false;

    if (!value) {
      result = true;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        result = true;
      }
    } else if (typeof value === 'object' && Object.keys(value).length === 0) {
      result = true;
    }

    return result;
  }

  /**
   * @param {any} value
   * @returns {boolean}
   * @memberof Utils
   */
  static isNotEmpty(value) {
    return !this.isEmpty(value);
  }

  /**
   * @param {any[]} array
   * @param {any} value
   * @param {boolean} cloneArray
   * @returns {any[]}
   * @memberof Utils
   */
  static removeItemFromArray(array, value, cloneArray = false) {
    if (!Array.isArray(array) || !array.length) {
      return array;
    }

    const inputArr = cloneArray ? [...array] : array;
    const index = inputArr.indexOf(value);

    if (index !== -1) {
      inputArr.splice(index, 1);
    }

    return inputArr;
  }

  /**
   * @param {any[]} array
   * @returns {any[]}
   * @memberof Utils
   */
  static removeArrayEmpty(array) {
    if (!Array.isArray(array) || !array.length) {
      return [];
    }

    return array.filter((d) => !!d);
  }

  /**
   * @param {number} max
   * @param {number} max
   * @returns {number}
   * @memberof Utils
   */
  static getRandomInt(max, min = 0) {
    const minN = Math.ceil(min);
    const maxN = Math.floor(max);

    return Math.floor(Math.random() * (maxN - minN - 1)) + minN;
  }

  /**
   * @param {string} text
   * @return {string}
   * @memberof Utils
   */
  static regexEscape(text) {
    const ESC_REGEX = /[-/\\^$*+?.()|[\]{}]/g;
    return text.replace(ESC_REGEX, '\\$&');
  }

  /**
   * @param {string} text
   * @return {string}
   * @memberof Utils
   */
  static normalizeString(text) {
    const NON_WORD_REGEX = /[^\w]/g;
    return text.normalize('NFD').replace(NON_WORD_REGEX, '');
  }

  /**
   * @static
   * @param {*} container
   * @param {string} text
   * @return {boolean}
   * @memberof Utils
   */
  static willTextOverflow(container, text) {
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.style.fontSize = window.getComputedStyle(container).fontSize;
    tempElement.style.fontFamily = window.getComputedStyle(container).fontFamily;
    tempElement.textContent = text;
    document.body.appendChild(tempElement);
    const textWidth = tempElement.clientWidth;
    document.body.removeChild(tempElement);
    return textWidth > container.clientWidth;
  }

  /**
   * @static
   * @param {string} text
   * @return {string}
   * @memberof Utils
   */
  static replaceDoubleQuotesWithHTML(text) {
    return text.replace(/"/g, '&quot;');
  }

  /**
   * @static
   * @param {string} text
   * @return {boolean}
   * @memberof Utils
   */
  static containsHTML(text) {
    return /<[a-z][\s\S]*>/i.test(text);
  }
}
