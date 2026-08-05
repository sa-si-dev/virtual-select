const NON_WORD_CHARS_REGEX = /[^\p{L}\p{N}_]/gu;

/**
 * @typedef {Object} ThrottledFunctionExtras
 * @property {() => void} cancel - Clears any pending trailing invocation.
 */
/**
 * A throttled wrapper that also exposes a `cancel()` method.
 * @typedef {((...args: unknown[]) => void) & ThrottledFunctionExtras} ThrottledFunction
 */

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
    return !Utils.isEmpty(value);
  }

  /**
   * Normalizes values by converting booleans to strings while preserving other types
   * Handles both single values and arrays efficiently
   * @param {*} value - The value to normalize
   * @return {*} - Normalized value(s)
   * @memberof Utils
   */
  static normalizeValues(value) {
    // Fast path for arrays
    if (Array.isArray(value)) {
      const result = new Array(value.length);
      for (let i = 0; i < value.length; i += 1) {
        const v = value[i];
        if (v === true) {
          result[i] = 'true';
        } else if (v === false) {
          result[i] = 'false';
        } else {
          result[i] = v;
        }
      }
      return result;
    }

    // Handle single values
    if (value === true) {
      return 'true';
    }
    if (value === false) {
      return 'false';
    }
    return value;
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
   * Normalizes a string for diacritic-insensitive search. Decomposes the input
   * via NFD, then strips every character that is not a Unicode letter
   * (\p{L}), number (\p{N}), or underscore. As a side effect this removes
   * combining marks (so "München" matches "Munchen", "Việt Nam" matches
   * "Viet Nam", "Ёжик" matches "Ежик") as well as punctuation and whitespace
   * (so "co-op" matches "coop" and "Foo Bar" collapses into "FooBar").
   * Base letters and numbers from many scripts (Latin, Greek, Cyrillic, CJK,
   * etc.) are preserved, but scripts that rely on combining marks are NOT
   * fully preserved — every Unicode combining mark is removed, which affects
   * Thai vowel signs, Devanagari matras, hiragana/katakana voicing marks
   * (dakuten/handakuten), etc. This produces fuzzier matching for those
   * scripts; use `searchNormalize: false` if exact-match behavior is
   * required.
   *
   * Note: a few atomic letters do not decompose under NFD (e.g. "ø", "æ", "ß")
   * and are kept as-is — a search for "Bjorn" will not match "Bjørn".
   *
   * @param {string} text
   * @return {string}
   * @memberof Utils
   */
  static normalizeString(text) {
    return text.normalize('NFD').replace(NON_WORD_CHARS_REGEX, '');
  }

  /**
   * @static
   * @param {*} container
   * @param {string} text
   * @return {boolean}
   * @memberof Utils
   */
  static willTextOverflow(container, text) {
    /**
     * Called once per selected tag to decide whether that tag needs a tooltip.
     *
     * It used to create a div, read two separate getComputedStyle results, append it to
     * <body>, read clientWidth and remove it again - so every tag paid an element creation
     * plus two DOM mutations, and each mutation invalidates layout for the read that
     * follows. Rendering many tags therefore meant a burst of forced synchronous layouts.
     *
     * One reusable off-screen node instead, and one getComputedStyle read for every property.
     * The node stays out of flow and is aria-hidden, so it cannot affect layout or be
     * announced, and it is removed once the last instance is destroyed.
     */
    const $measurer = Utils.getTextMeasurer();
    const { fontSize, fontFamily, fontWeight, letterSpacing } = window.getComputedStyle(container);

    $measurer.style.fontSize = fontSize;
    $measurer.style.fontFamily = fontFamily;
    /** weight and tracking change advance width too, so ignoring them under-reported
     *  overflow and could drop a tooltip that was actually needed */
    $measurer.style.fontWeight = fontWeight;
    $measurer.style.letterSpacing = letterSpacing;
    $measurer.textContent = text;

    return $measurer.clientWidth > container.clientWidth;
  }

  /**
   * Whether the user has asked the operating system to reduce motion.
   *
   * Read on each call rather than cached, so a preference changed after page load is picked up
   * by the next instance. Guarded for environments without matchMedia.
   *
   * @static
   * @returns {boolean}
   */
  static prefersReducedMotion() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * The shared, lazily created off-screen node used to measure text width.
   *
   * @static
   * @returns {HTMLElement}
   */
  static getTextMeasurer() {
    if (!Utils.$textMeasurer || !Utils.$textMeasurer.isConnected) {
      const $measurer = document.createElement('div');

      $measurer.className = 'vscomp-text-measurer';
      $measurer.setAttribute('aria-hidden', 'true');
      $measurer.style.cssText =
        'position:absolute;top:0;left:-9999px;visibility:hidden;white-space:nowrap;pointer-events:none;';

      document.body.appendChild($measurer);
      Utils.$textMeasurer = $measurer;
    }

    return Utils.$textMeasurer;
  }

  /**
   * Drop the shared measuring node, so nothing of ours is left in the document once the last
   * instance has gone.
   *
   * @static
   */
  static removeTextMeasurer() {
    if (Utils.$textMeasurer) {
      Utils.$textMeasurer.remove();
      Utils.$textMeasurer = null;
    }
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
   * Escape a *raw* string for interpolation into a double-quoted HTML attribute.
   *
   * Use this only where the input has not already been HTML-escaped - currently the option
   * value, which is stored verbatim because it reaches no innerHTML sink. `&` must be escaped
   * first, otherwise the `&` introduced by the quote replacement would itself be escaped and
   * the attribute would parse back as a literal `&quot;`.
   *
   * Deliberately NOT used by DomUtils.getAttributesText(), whose inputs are already-escaped
   * label text: escaping `&` there would double it and a tooltip would show `&amp;`. That
   * asymmetry is the reason this is a separate helper rather than a shared one.
   *
   * @static
   * @param {string} text
   * @return {string}
   * @memberof Utils
   */
  static escapeAttributeValue(text) {
    return Utils.getString(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  /**
   * Undo the escaping secureText() applies, recovering the text a human should read.
   *
   * Option label and description are stored HTML-escaped when enableSecureText is on, because
   * they are inserted as HTML. Anywhere that text is consumed as *text* instead - an accessible
   * name, a live-region announcement - the escape sequences have to come back off, or the user
   * is read `&amp;` and `&lt;i class=...`.
   *
   * `&amp;` is decoded last: doing it first would turn a literal `&amp;lt;` into `&lt;` and then
   * into `<`, inventing markup the consumer never wrote.
   *
   * @static
   * @param {string} text
   * @return {string}
   * @memberof Utils
   */
  static decodeSecureText(text) {
    return Utils.getString(text)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }

  /**
   * Reduce label text to the words a human should hear or read.
   *
   * Labels may legitimately contain markup - an icon, <b>, a <br>. Wherever that text is
   * consumed as text (an accessible name, a live-region announcement) the markup is meaningless
   * and is read out as tag soup. Tags collapse to a single space so adjacent words do not run
   * together, so "France<br>Paris" does not become one word.
   *
   * The escaping is undone first. With enableSecureText on the label arrives already escaped, so
   * the tag pattern found no `<` to match and the markup passed through verbatim - the strip was
   * a no-op in exactly the mode escaping is enabled in.
   *
   * @static
   * @param {string} text
   * @return {string}
   * @memberof Utils
   */
  static getPlainText(text) {
    return Utils.decodeSecureText(text)
      .replace(/<[^>]+>/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Turn a label into text that is safe and sensible inside an aria-label attribute.
   *
   * Plain text, then escaped for the attribute - covering `&` as well as `"`, so a bare
   * ampersand in a label is a valid character reference rather than raw markup, and a double
   * quote can no longer close the attribute early and truncate the name.
   *
   * @static
   * @param {string} text
   * @returns {string}
   */
  static getAriaLabelText(text) {
    return Utils.escapeAttributeValue(Utils.getPlainText(text));
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

  /**
   * @static
   * @param {string} text
   * @return {boolean}
   * @memberof Utils
   */
  static containsHTMLorJS(text) {
    return /<([a-z]+)[\s\S]*?>|on\w+="[^"]*"/i.test(text);
  }

  /**
   * Remove characters that could break out of the double-quoted class attribute
   * (`"`, `<`, `>`). Valid CSS class tokens never contain these characters, so legitimate
   * class names are left untouched while attribute-injection via classNames is prevented.
   * @static
   * @param {string} classNames
   * @return {string}
   * @memberof Utils
   */
  static sanitizeClassNames(classNames) {
    return classNames ? String(classNames).replace(/["<>]/g, '') : classNames;
  }

  /**
   * Rate-limit a function so it runs at most once per `wait` ms (leading + trailing edge).
   * Used to keep high-frequency events (e.g. window resize) from running per-instance work
   * on every tick.
   * @static
   * @param {Function} callback
   * @param {number} wait
   * @return {ThrottledFunction}
   * @memberof Utils
   */
  static throttle(callback, wait) {
    /** @type {ReturnType<typeof setTimeout> | null} */
    let timeout = null;
    /** @type {unknown[]} */
    let lastArgs = [];
    /** @type {unknown} */
    let lastThis;
    let previous = 0;

    /**
     * Invoke the callback with the retained context/args, snapshotting and clearing those
     * references BEFORE the call. If the callback re-enters (calls the throttled function
     * again, directly or indirectly) it then captures its own fresh args/this instead of
     * having them wiped by this invocation's cleanup. Clearing first also avoids retaining
     * a large last argument (e.g. a DOM Event) after the call.
     */
    function invoke() {
      const thisArg = lastThis;
      const args = lastArgs;
      lastArgs = [];
      lastThis = undefined;
      callback.apply(thisArg, args);
    }

    /**
     * @this {unknown}
     * @param {unknown[]} args
     */
    function throttled(...args) {
      const now = Date.now();
      const remaining = wait - (now - previous);
      lastArgs = args;
      lastThis = this;

      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        invoke();
      } else if (!timeout) {
        timeout = setTimeout(() => {
          previous = Date.now();
          timeout = null;
          invoke();
        }, remaining);
      }
    }

    /**
     * Clear any pending trailing invocation and reset internal state. Call this before
     * detaching a throttled listener so a queued trailing call cannot fire afterwards.
     */
    throttled.cancel = function cancel() {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = 0;
      lastArgs = [];
      lastThis = undefined;
    };

    return throttled;
  }
}

/**
 * Shared off-screen node used to measure text width, created on first use and removed when
 * the last VirtualSelect instance is destroyed.
 * @type {HTMLElement | null}
 */
Utils.$textMeasurer = null;
