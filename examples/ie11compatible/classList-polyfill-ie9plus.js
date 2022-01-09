var origToggle;

// Has the polyfill been applied
var fixed = false;

/**
 * The polyfill method
 * @api private
 */
function method(val, force) {
  var ret, el = this;

  if(force === true) {
    this.add(val);
  } else if(force === false) {
    this.remove(val);
  } else {
    return origToggle.call(this, val);
  }
  return this.contains(val);
}


/**
 * Test if the fix is required
 *
 * @param {Boolean} initialValue if `true` was it initially required?
 * @return {Boolean}
 * @api public
 */
function required(initialValue) {
  var ret, el;

  // Was it initially required
  if(initialValue && fixed)  {
    return true;
  }

  // Don't try and polyfill if we're totally unsupported
  if(typeof(window.DOMTokenList) === 'undefined') {
    return false;
  }

  // The test element
  el = document.createElement("div");

  // Test force on. Add class first to test against normal toggle behaviour.
  el.classList.add("t");
  ret = el.classList.toggle("t", true);
  if(ret !== true || !el.classList.contains("t")) {
    return true;
  }

  // Test force off
  ret = el.classList.toggle("o", false);
  if (ret !== false || el.classList.contains("o")) {
    return true;
  }

  return false;
}


/**
 * Fix the toggle if required.
 * @return {Function} method used in fix.
 */
function fix() {
  if(required()) {
    origToggle = DOMTokenList.prototype.toggle;
    fixed = true;
    DOMTokenList.prototype.toggle = method;
    return method;
  }
}

fix();
