export class Utils {
  static getString(text) {
    return text || text === 0 ? text.toString() : '';
  }

  static convertToBoolean(value, defaultValue = false) {
    if (value === true || value === 'true') {
      value = true;
    } else if (value === false || value === 'false') {
      value = false;
    } else {
      value = defaultValue;
    }

    return value;
  }

  static isEmpty(value) {
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

  static isNotEmpty(value) {
    return !this.isEmpty(value);
  }

  static removeItemFromArray(array, value, cloneArray) {
    if (!Array.isArray(array) || !array.length) {
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

  static removeArrayEmpty(array) {
    if (!Array.isArray(array) || !array.length) {
      return [];
    }

    return array.filter((d) => !!d);
  }

  /**
   * @param {number} max
   * @param {number} max
   */
  static getRandomInt(max, min = 0) {
    const minN = Math.ceil(min);
    const maxN = Math.floor(max);

    return Math.floor(Math.random() * (maxN - minN - 1)) + minN;
  }
}
