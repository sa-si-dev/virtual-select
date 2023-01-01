export class Utils {
  /**
   * @param {any} text
   * @returns {string}
   */
  static getString(text) {
    return text || text === 0 ? text.toString() : '';
  }

  /**
   * @param {any} value
   * @param {boolean} defaultValue
   * @returns {boolean}
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
   */
  static isNotEmpty(value) {
    return !this.isEmpty(value);
  }

  /**
   * @param {any[]} array
   * @param {any} value
   * @param {boolean} cloneArray
   * @returns {any[]}
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
   */
  static getRandomInt(max, min = 0) {
    const minN = Math.ceil(min);
    const maxN = Math.floor(max);

    return Math.floor(Math.random() * (maxN - minN - 1)) + minN;
  }

  /**
   * @param {string} text
   * @return {string}
   */
  static regexEscape(text) {
    return text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
}
