/**
 * available data attributes (data-*)
 * tooltip - required - text to show
 * position - [auto] - available options top, bottom, left, right
 * z-index - [1]
 * margin - [0] - distance between tooltip and its activator
 * enterDelay - [0] - show tooltip after given duration (in milliseconds)
 * exitDelay - [0] - hide tooltip after given duration (in milliseconds)
 * showDuration - [300] - time taken for show animation (in milliseconds)
 * hideDuration - [200] - time taken for hide animation (in milliseconds)
 * transitionDistance - [10] - distance to translate on show/hide animation
 */
(function() {
  let $body = document.querySelector('body');
  let $tooltip;
  let $currentEle;
  let options = {};
  let enterDelayTimeout;
  let exitDelayTimeout;
  let hideDurationTimeout;

  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('mouseout', onMouseOut);

  function onMouseOver(e) {
    if ($currentEle) {
      return;
    }

    let target = e.target.closest('[data-tooltip]');

    if (!target) {
      return;
    }

    $currentEle = target;
    showTooltip();
  }

  function onMouseOut(e) {
    if (!$currentEle) {
      return;
    }

    let target = e.relatedTarget;

    while(target) {
      if (target === $currentEle) {
        return;
      }

      target = target.parentNode;
    }

    hideTooltip();
  }

  function renderTooltip() {
    let html = `<div class="tooltip-box">${options.tooltip}</div>`;

    $body.insertAdjacentHTML('afterend', html);

    $tooltip = document.querySelector('.tooltip-box');
    setStyle($tooltip, 'zIndex', options.zIndex);
  }

  function setPosition() {
    let currentEleCoords = getCoords($currentEle);
    let tooltipCoords = getCoords($tooltip);
    let left = currentEleCoords.left;
    let top = currentEleCoords.top;
    let tooltipWidth = tooltipCoords.width;
    let tooltipHeight = tooltipCoords.height;
    let parentWidth = currentEleCoords.width;
    let parentHeight = currentEleCoords.height;
    let position = options.position;
    let widthCenter = (parentWidth / 2) - (tooltipWidth / 2);
    let heightCenter = (parentHeight / 2) - (tooltipHeight / 2);
    let margin = options.margin;
    let transitionDistance = options.transitionDistance;
    let fromTop;
    let fromLeft;

    if (position === 'auto') {
      let moreVisibleSides = getMoreVisibleSides($currentEle);
      position = moreVisibleSides.vertical;
    }
    
    if (position === 'top') {
      top = top - tooltipHeight - margin;
      left = left + widthCenter;
      fromTop = top + transitionDistance;
      fromLeft = left;
    } else if (position === 'right') {
      top = top + heightCenter;
      left = left + parentWidth + margin;
      fromTop = top;
      fromLeft = left - transitionDistance;
    } else if (position === 'left') {
      top = top + heightCenter;
      left = left - tooltipWidth - margin;
      fromTop = top;
      fromLeft = left + transitionDistance;
    } else {
      top = top + parentHeight + margin;
      left = left + widthCenter;
      fromTop = top - transitionDistance;
      fromLeft = left;
    }
    
    let transformText = `translate3d(${fromLeft}px, ${fromTop}px, 0)`;

    setStyle($tooltip, 'transform', transformText);
    setData($tooltip, 'fromLeft', fromLeft);
    setData($tooltip, 'fromTop', fromTop);
    setData($tooltip, 'top', top);
    setData($tooltip, 'left', left);
  }

  function showTooltip() {
    if (!$currentEle) {
      return;
    }

    let dataset = $currentEle.dataset;
    options = {
      tooltip: dataset.tooltip,
      position: dataset.tooltipPosition || 'auto',
      zIndex: parseFloat(dataset.tooltipZindex) || 1,
      enterDelay: parseFloat(dataset.tooltipEnterDelay) || 0,
      exitDelay: parseFloat(dataset.tooltipExitDelay) || 0,
      margin: parseFloat(dataset.tooltipMargin) || 4,
      showDuration: parseFloat(dataset.tooltipShowDuration) || 300,
      hideDuration: parseFloat(dataset.tooltipHideDuration) || 200,
      transitionDistance: parseFloat(dataset.tooltipTransitionDistance) || 10,
    };

    if (!options.tooltip) {
      return;
    }

    removeTooltip();
    renderTooltip();
    setPosition();
    clearTimeout(exitDelayTimeout);
    clearTimeout(hideDurationTimeout);

    enterDelayTimeout = setTimeout(() => {
      let left = getData($tooltip, 'left');
      let top = getData($tooltip, 'top');
      let transformText = `translate3d(${left}px, ${top}px, 0)`;
      
      setStyle($tooltip, 'transitionDuration', options.showDuration + 'ms');
      setStyle($tooltip, 'transform', transformText);
      setStyle($tooltip, 'opacity', 1);
    }, options.enterDelay);
  }

  function hideTooltip() {
    if (!$tooltip && !$currentEle) {
      return;
    }

    clearTimeout(enterDelayTimeout);

    exitDelayTimeout = setTimeout(() => {
      if ($tooltip) {
        let left = getData($tooltip, 'fromLeft');
        let top = getData($tooltip, 'fromTop');
        let transformText = `translate3d(${left}px, ${top}px, 0)`;
        let hideDuration = options.hideDuration;
        
        setStyle($tooltip, 'transitionDuration', hideDuration + 'ms');
        setStyle($tooltip, 'transform', transformText);
        setStyle($tooltip, 'opacity', 0);

        hideDurationTimeout = setTimeout(() => {
          removeTooltip();
        }, hideDuration);
      }
    }, options.exitDelay);

    $currentEle = null;
  }

  function removeTooltip() {
    if ($tooltip) {
      $tooltip.remove();
    }
  }

  function setStyle($ele, name, value) {
    if (!$ele) {
      return;
    }

    $ele.style[name] = value;
  }

  function setData($ele, name, value) {
    if ($ele) {
      $ele.dataset[name] = value;
    }
  }

  function getData($ele, name, type) {
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

  function getCoords($ele) {
    if (!$ele) {
      return;
    }

    let box = $ele.getBoundingClientRect();
    let pageX = window.pageXOffset;
    let pageY = window.pageYOffset;

    return {
      width: box.width,
      height: box.height,
      top: box.top + pageY,
      right: box.right + pageX,
      bottom: box.bottom + pageY,
      left: box.left + pageX,
    };
  }

  function getMoreVisibleSides($ele) {
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
})();