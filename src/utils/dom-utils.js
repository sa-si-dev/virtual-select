import { Utils } from './utils';

export class DomUtils {
  /**
   * @param {HTMLElement | NodeListOf<HTMLElement>} $ele
   * @param {string} classNames
   */
  static addClass($ele, classNames) {
    if (!$ele) {
      return;
    }

    const classNamesArr = classNames.split(' ');

    DomUtils.getElements($ele).forEach(($this) => {
      $this.classList.add(...classNamesArr);
    });
  }

  /**
   * @param {HTMLElement | NodeListOf<HTMLElement>} $ele
   * @param {string} classNames
   */
  static removeClass($ele, classNames) {
    if (!$ele) {
      return;
    }

    const classNamesArr = classNames.split(' ');

    DomUtils.getElements($ele).forEach(($this) => {
      $this.classList.remove(...classNamesArr);
    });
  }

  /**
   * @param {HTMLElement | NodeListOf<HTMLElement>} $ele
   * @param {string} classNames
   * @param {boolean} [isAdd]
   */
  static toggleClass($ele, classNames, isAdd) {
    if (!$ele) {
      return;
    }

    /** @type {boolean | undefined} */
    let isAdding;

    if (isAdd !== undefined) {
      isAdding = Boolean(isAdd);
    }

    DomUtils.getElements($ele).forEach(($this) => {
      $this.classList.toggle(classNames, isAdding);
    });
  }

  /**
   * @param {HTMLElement} $ele
   * @param {string} className
   * @returns {boolean}
   */
  static hasClass($ele, className) {
    if (!$ele) {
      return false;
    }

    return $ele.classList.contains(className);
  }

  /**
   * @param {HTMLElement} $ele
   * @returns {boolean}
   */
  static hasEllipsis($ele) {
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
  static getData($ele, name, type) {
    if (!$ele) {
      return undefined;
    }

    /** @type {any} */
    let value = $ele ? $ele.dataset[name] : '';

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
  static setData($ele, name, value) {
    if (!$ele) {
      return;
    }

    // eslint-disable-next-line no-param-reassign
    $ele.dataset[name] = value;
  }

  /**
   * @param {HTMLElement} $ele
   * @param {string} name
   * @param {string} value
   */
  static setAttr($ele, name, value) {
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
  static setAttrFromEle($from, $to, attrList, valueLessProps) {
    /** @type {any} */
    const values = {};

    attrList.forEach((attr) => {
      values[attr] = $from.getAttribute(attr);
    });

    attrList.forEach((attr) => {
      const value = values[attr];

      if (value || (valueLessProps.indexOf(attr) !== -1 && value === '')) {
        $to.setAttribute(attr, value);
      }
    });
  }

  /**
   * @param {HTMLElement} $ele
   * @param {string} name
   * @param {string} value
   */
  static setStyle($ele, name, value) {
    if (!$ele) {
      return;
    }

    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    $ele.style[name] = value;
  }

  /**
   * @param {HTMLElement} $ele
   * @param {any} props
   */
  static setStyles($ele, props) {
    if (!$ele || !props) {
      return;
    }

    Object.keys(props).forEach((name) => {
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
  static setAria($ele, name, value) {
    let attrName = name;

    if (attrName !== 'role') {
      attrName = `aria-${attrName}`;
    }

    $ele.setAttribute(attrName, value);
  }

  /**
   * @param {any} $ele
   * @returns {any[]}
   */
  static getElements($ele) {
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
  static addEvent($ele, events, callback) {
    if (!$ele) {
      return;
    }

    const eventsArray = Utils.removeArrayEmpty(events.split(' '));

    eventsArray.forEach((event) => {
      const $eleArray = DomUtils.getElements($ele);

      $eleArray.forEach(($this) => {
        $this.addEventListener(event, callback);
      });
    });
  }

  /**
   * @param {HTMLElement} $ele
   * @param {string} eventName
   * @param {boolean} [bubbles]
   */
  static dispatchEvent($ele, eventName, bubbles = false) {
    if (!$ele) {
      return;
    }

    const $eleArray = DomUtils.getElements($ele);

    /** using setTimeout to trigger asynchronous event */
    setTimeout(() => {
      $eleArray.forEach(($this) => {
        $this.dispatchEvent(new CustomEvent(eventName, { bubbles }));
      });
    }, 0);
  }

  /**
   * convert object to dom attributes
   * @param {any} data
   */
  static getAttributesText(data) {
    let html = '';

    if (!data) {
      return html;
    }

    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) {
        html += ` ${k}="${v}" `;
      }
    });

    return html;
  }

  /**
   * convert "maxValue" to "data-max-value"
   * @param {string} prop
   */
  static convertPropToDataAttr(prop) {
    return prop ? `data-${prop}`.replace(/([A-Z])/g, '-$1').toLowerCase() : '';
  }
}
