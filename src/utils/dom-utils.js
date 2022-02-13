import { Utils } from './index';

export class DomUtils {
  static addClass($ele, className) {
    if (!$ele) {
      return;
    }

    className = className.split(' ');

    DomUtils.getElements($ele).forEach(($this) => {
      $this.classList.add(...className);
    });
  }

  static removeClass($ele, className) {
    if (!$ele) {
      return;
    }

    className = className.split(' ');

    DomUtils.getElements($ele).forEach(($this) => {
      $this.classList.remove(...className);
    });
  }

  static toggleClass($ele, className, isAdd) {
    if (!$ele) {
      return;
    }

    if (isAdd !== undefined) {
      isAdd = Boolean(isAdd);
    }

    let isAdded;

    DomUtils.getElements($ele).forEach(($this) => {
      isAdded = $this.classList.toggle(className, isAdd);
    });

    return isAdded;
  }

  static hasClass($ele, className) {
    if (!$ele) {
      return false;
    }

    return $ele.classList.contains(className);
  }

  static hasEllipsis($ele) {
    if (!$ele) {
      return false;
    }

    return $ele.scrollWidth > $ele.offsetWidth;
  }

  static getData($ele, name, type) {
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

  static setData($ele, name, value) {
    if (!$ele) {
      return;
    }

    $ele.dataset[name] = value;
  }

  static setAttr($ele, name, value) {
    if (!$ele) {
      return;
    }

    $ele.setAttribute(name, value);
  }

  static setAttrFromEle($from, $to, attrList, valueLessProps) {
    const values = {};

    attrList.forEach((attr) => {
      values[attr] = $from.getAttribute(attr);
    });

    attrList.forEach((attr) => {
      let value = values[attr];

      if (value || (valueLessProps.indexOf(attr) !== -1 && value === '')) {
        $to.setAttribute(attr, value);
      }
    });
  }

  static setStyle($ele, name, value) {
    if (!$ele) {
      return;
    }

    $ele.style[name] = value;
  }

  static setStyles($ele, props) {
    if (!$ele || !props) {
      return;
    }

    Object.keys(props).forEach((name) => {
      $ele.style[name] = props[name];
    });
  }

  static setAria($ele, name, value) {
    let attrName = name;

    if (attrName !== 'role') {
      attrName = `aria-${attrName}`;
    }

    $ele.setAttribute(attrName, value);
  }

  static getElements($ele) {
    if (!$ele) {
      return;
    }

    if ($ele.forEach === undefined) {
      $ele = [$ele];
    }

    return $ele;
  }

  static addEvent($ele, events, callback) {
    if (!$ele) {
      return;
    }

    events = Utils.removeArrayEmpty(events.split(' '));

    events.forEach((event) => {
      $ele = DomUtils.getElements($ele);

      $ele.forEach(($this) => {
        $this.addEventListener(event, callback);
      });
    });
  }

  static dispatchEvent($ele, eventName, bubbles = false) {
    if (!$ele) {
      return;
    }

    $ele = DomUtils.getElements($ele);

    /** using setTimeout to trigger asynchronous event */
    setTimeout(() => {
      $ele.forEach(($this) => {
        $this.dispatchEvent(new CustomEvent(eventName, { bubbles }));
      });
    }, 0);
  }

  /** convert object to dom attributes */
  static getAttributesText(data) {
    let html = '';

    if (!data) {
      return html;
    }

    for (let k in data) {
      let value = data[k];

      if (value !== undefined) {
        html += ` ${k}="${value}" `;
      }
    }

    return html;
  }

  /** convert "maxValue" to "data-max-value" */
  static convertPropToDataAttr(prop) {
    return prop ? `data-${prop}`.replace(/([A-Z])/g, '-$1').toLowerCase() : '';
  }
}
