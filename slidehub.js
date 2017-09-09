/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(1);
const initialize = __webpack_require__(2);
initialize();

__webpack_require__(3);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(window, document) {
'use strict';


// Exits early if all IntersectionObserver and IntersectionObserverEntry
// features are natively supported.
if ('IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype) {

  // Minimal polyfill for Edge 15's lack of `isIntersecting`
  // See: https://github.com/WICG/IntersectionObserver/issues/211
  if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
    Object.defineProperty(window.IntersectionObserverEntry.prototype,
      'isIntersecting', {
      get: function () {
        return this.intersectionRatio > 0;
      }
    });
  }
  return;
}


/**
 * An IntersectionObserver registry. This registry exists to hold a strong
 * reference to IntersectionObserver instances currently observering a target
 * element. Without this registry, instances without another reference may be
 * garbage collected.
 */
var registry = [];


/**
 * Creates the global IntersectionObserverEntry constructor.
 * https://wicg.github.io/IntersectionObserver/#intersection-observer-entry
 * @param {Object} entry A dictionary of instance properties.
 * @constructor
 */
function IntersectionObserverEntry(entry) {
  this.time = entry.time;
  this.target = entry.target;
  this.rootBounds = entry.rootBounds;
  this.boundingClientRect = entry.boundingClientRect;
  this.intersectionRect = entry.intersectionRect || getEmptyRect();
  this.isIntersecting = !!entry.intersectionRect;

  // Calculates the intersection ratio.
  var targetRect = this.boundingClientRect;
  var targetArea = targetRect.width * targetRect.height;
  var intersectionRect = this.intersectionRect;
  var intersectionArea = intersectionRect.width * intersectionRect.height;

  // Sets intersection ratio.
  if (targetArea) {
    this.intersectionRatio = intersectionArea / targetArea;
  } else {
    // If area is zero and is intersecting, sets to 1, otherwise to 0
    this.intersectionRatio = this.isIntersecting ? 1 : 0;
  }
}


/**
 * Creates the global IntersectionObserver constructor.
 * https://wicg.github.io/IntersectionObserver/#intersection-observer-interface
 * @param {Function} callback The function to be invoked after intersection
 *     changes have queued. The function is not invoked if the queue has
 *     been emptied by calling the `takeRecords` method.
 * @param {Object=} opt_options Optional configuration options.
 * @constructor
 */
function IntersectionObserver(callback, opt_options) {

  var options = opt_options || {};

  if (typeof callback != 'function') {
    throw new Error('callback must be a function');
  }

  if (options.root && options.root.nodeType != 1) {
    throw new Error('root must be an Element');
  }

  // Binds and throttles `this._checkForIntersections`.
  this._checkForIntersections = throttle(
      this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);

  // Private properties.
  this._callback = callback;
  this._observationTargets = [];
  this._queuedEntries = [];
  this._rootMarginValues = this._parseRootMargin(options.rootMargin);

  // Public properties.
  this.thresholds = this._initThresholds(options.threshold);
  this.root = options.root || null;
  this.rootMargin = this._rootMarginValues.map(function(margin) {
    return margin.value + margin.unit;
  }).join(' ');
}


/**
 * The minimum interval within which the document will be checked for
 * intersection changes.
 */
IntersectionObserver.prototype.THROTTLE_TIMEOUT = 100;


/**
 * The frequency in which the polyfill polls for intersection changes.
 * this can be updated on a per instance basis and must be set prior to
 * calling `observe` on the first target.
 */
IntersectionObserver.prototype.POLL_INTERVAL = null;


/**
 * Starts observing a target element for intersection changes based on
 * the thresholds values.
 * @param {Element} target The DOM element to observe.
 */
IntersectionObserver.prototype.observe = function(target) {
  // If the target is already being observed, do nothing.
  if (this._observationTargets.some(function(item) {
    return item.element == target;
  })) {
    return;
  }

  if (!(target && target.nodeType == 1)) {
    throw new Error('target must be an Element');
  }

  this._registerInstance();
  this._observationTargets.push({element: target, entry: null});
  this._monitorIntersections();
};


/**
 * Stops observing a target element for intersection changes.
 * @param {Element} target The DOM element to observe.
 */
IntersectionObserver.prototype.unobserve = function(target) {
  this._observationTargets =
      this._observationTargets.filter(function(item) {

    return item.element != target;
  });
  if (!this._observationTargets.length) {
    this._unmonitorIntersections();
    this._unregisterInstance();
  }
};


/**
 * Stops observing all target elements for intersection changes.
 */
IntersectionObserver.prototype.disconnect = function() {
  this._observationTargets = [];
  this._unmonitorIntersections();
  this._unregisterInstance();
};


/**
 * Returns any queue entries that have not yet been reported to the
 * callback and clears the queue. This can be used in conjunction with the
 * callback to obtain the absolute most up-to-date intersection information.
 * @return {Array} The currently queued entries.
 */
IntersectionObserver.prototype.takeRecords = function() {
  var records = this._queuedEntries.slice();
  this._queuedEntries = [];
  return records;
};


/**
 * Accepts the threshold value from the user configuration object and
 * returns a sorted array of unique threshold values. If a value is not
 * between 0 and 1 and error is thrown.
 * @private
 * @param {Array|number=} opt_threshold An optional threshold value or
 *     a list of threshold values, defaulting to [0].
 * @return {Array} A sorted list of unique and valid threshold values.
 */
IntersectionObserver.prototype._initThresholds = function(opt_threshold) {
  var threshold = opt_threshold || [0];
  if (!Array.isArray(threshold)) threshold = [threshold];

  return threshold.sort().filter(function(t, i, a) {
    if (typeof t != 'number' || isNaN(t) || t < 0 || t > 1) {
      throw new Error('threshold must be a number between 0 and 1 inclusively');
    }
    return t !== a[i - 1];
  });
};


/**
 * Accepts the rootMargin value from the user configuration object
 * and returns an array of the four margin values as an object containing
 * the value and unit properties. If any of the values are not properly
 * formatted or use a unit other than px or %, and error is thrown.
 * @private
 * @param {string=} opt_rootMargin An optional rootMargin value,
 *     defaulting to '0px'.
 * @return {Array<Object>} An array of margin objects with the keys
 *     value and unit.
 */
IntersectionObserver.prototype._parseRootMargin = function(opt_rootMargin) {
  var marginString = opt_rootMargin || '0px';
  var margins = marginString.split(/\s+/).map(function(margin) {
    var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
    if (!parts) {
      throw new Error('rootMargin must be specified in pixels or percent');
    }
    return {value: parseFloat(parts[1]), unit: parts[2]};
  });

  // Handles shorthand.
  margins[1] = margins[1] || margins[0];
  margins[2] = margins[2] || margins[0];
  margins[3] = margins[3] || margins[1];

  return margins;
};


/**
 * Starts polling for intersection changes if the polling is not already
 * happening, and if the page's visibilty state is visible.
 * @private
 */
IntersectionObserver.prototype._monitorIntersections = function() {
  if (!this._monitoringIntersections) {
    this._monitoringIntersections = true;

    this._checkForIntersections();

    // If a poll interval is set, use polling instead of listening to
    // resize and scroll events or DOM mutations.
    if (this.POLL_INTERVAL) {
      this._monitoringInterval = setInterval(
          this._checkForIntersections, this.POLL_INTERVAL);
    }
    else {
      addEvent(window, 'resize', this._checkForIntersections, true);
      addEvent(document, 'scroll', this._checkForIntersections, true);

      if ('MutationObserver' in window) {
        this._domObserver = new MutationObserver(this._checkForIntersections);
        this._domObserver.observe(document, {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        });
      }
    }
  }
};


/**
 * Stops polling for intersection changes.
 * @private
 */
IntersectionObserver.prototype._unmonitorIntersections = function() {
  if (this._monitoringIntersections) {
    this._monitoringIntersections = false;

    clearInterval(this._monitoringInterval);
    this._monitoringInterval = null;

    removeEvent(window, 'resize', this._checkForIntersections, true);
    removeEvent(document, 'scroll', this._checkForIntersections, true);

    if (this._domObserver) {
      this._domObserver.disconnect();
      this._domObserver = null;
    }
  }
};


/**
 * Scans each observation target for intersection changes and adds them
 * to the internal entries queue. If new entries are found, it
 * schedules the callback to be invoked.
 * @private
 */
IntersectionObserver.prototype._checkForIntersections = function() {
  var rootIsInDom = this._rootIsInDom();
  var rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();

  this._observationTargets.forEach(function(item) {
    var target = item.element;
    var targetRect = getBoundingClientRect(target);
    var rootContainsTarget = this._rootContainsTarget(target);
    var oldEntry = item.entry;
    var intersectionRect = rootIsInDom && rootContainsTarget &&
        this._computeTargetAndRootIntersection(target, rootRect);

    var newEntry = item.entry = new IntersectionObserverEntry({
      time: now(),
      target: target,
      boundingClientRect: targetRect,
      rootBounds: rootRect,
      intersectionRect: intersectionRect
    });

    if (!oldEntry) {
      this._queuedEntries.push(newEntry);
    } else if (rootIsInDom && rootContainsTarget) {
      // If the new entry intersection ratio has crossed any of the
      // thresholds, add a new entry.
      if (this._hasCrossedThreshold(oldEntry, newEntry)) {
        this._queuedEntries.push(newEntry);
      }
    } else {
      // If the root is not in the DOM or target is not contained within
      // root but the previous entry for this target had an intersection,
      // add a new record indicating removal.
      if (oldEntry && oldEntry.isIntersecting) {
        this._queuedEntries.push(newEntry);
      }
    }
  }, this);

  if (this._queuedEntries.length) {
    this._callback(this.takeRecords(), this);
  }
};


/**
 * Accepts a target and root rect computes the intersection between then
 * following the algorithm in the spec.
 * TODO(philipwalton): at this time clip-path is not considered.
 * https://wicg.github.io/IntersectionObserver/#calculate-intersection-rect-algo
 * @param {Element} target The target DOM element
 * @param {Object} rootRect The bounding rect of the root after being
 *     expanded by the rootMargin value.
 * @return {?Object} The final intersection rect object or undefined if no
 *     intersection is found.
 * @private
 */
IntersectionObserver.prototype._computeTargetAndRootIntersection =
    function(target, rootRect) {

  // If the element isn't displayed, an intersection can't happen.
  if (window.getComputedStyle(target).display == 'none') return;

  var targetRect = getBoundingClientRect(target);
  var intersectionRect = targetRect;
  var parent = getParentNode(target);
  var atRoot = false;

  while (!atRoot) {
    var parentRect = null;
    var parentComputedStyle = parent.nodeType == 1 ?
        window.getComputedStyle(parent) : {};

    // If the parent isn't displayed, an intersection can't happen.
    if (parentComputedStyle.display == 'none') return;

    if (parent == this.root || parent == document) {
      atRoot = true;
      parentRect = rootRect;
    } else {
      // If the element has a non-visible overflow, and it's not the <body>
      // or <html> element, update the intersection rect.
      // Note: <body> and <html> cannot be clipped to a rect that's not also
      // the document rect, so no need to compute a new intersection.
      if (parent != document.body &&
          parent != document.documentElement &&
          parentComputedStyle.overflow != 'visible') {
        parentRect = getBoundingClientRect(parent);
      }
    }

    // If either of the above conditionals set a new parentRect,
    // calculate new intersection data.
    if (parentRect) {
      intersectionRect = computeRectIntersection(parentRect, intersectionRect);

      if (!intersectionRect) break;
    }
    parent = getParentNode(parent);
  }
  return intersectionRect;
};


/**
 * Returns the root rect after being expanded by the rootMargin value.
 * @return {Object} The expanded root rect.
 * @private
 */
IntersectionObserver.prototype._getRootRect = function() {
  var rootRect;
  if (this.root) {
    rootRect = getBoundingClientRect(this.root);
  } else {
    // Use <html>/<body> instead of window since scroll bars affect size.
    var html = document.documentElement;
    var body = document.body;
    rootRect = {
      top: 0,
      left: 0,
      right: html.clientWidth || body.clientWidth,
      width: html.clientWidth || body.clientWidth,
      bottom: html.clientHeight || body.clientHeight,
      height: html.clientHeight || body.clientHeight
    };
  }
  return this._expandRectByRootMargin(rootRect);
};


/**
 * Accepts a rect and expands it by the rootMargin value.
 * @param {Object} rect The rect object to expand.
 * @return {Object} The expanded rect.
 * @private
 */
IntersectionObserver.prototype._expandRectByRootMargin = function(rect) {
  var margins = this._rootMarginValues.map(function(margin, i) {
    return margin.unit == 'px' ? margin.value :
        margin.value * (i % 2 ? rect.width : rect.height) / 100;
  });
  var newRect = {
    top: rect.top - margins[0],
    right: rect.right + margins[1],
    bottom: rect.bottom + margins[2],
    left: rect.left - margins[3]
  };
  newRect.width = newRect.right - newRect.left;
  newRect.height = newRect.bottom - newRect.top;

  return newRect;
};


/**
 * Accepts an old and new entry and returns true if at least one of the
 * threshold values has been crossed.
 * @param {?IntersectionObserverEntry} oldEntry The previous entry for a
 *    particular target element or null if no previous entry exists.
 * @param {IntersectionObserverEntry} newEntry The current entry for a
 *    particular target element.
 * @return {boolean} Returns true if a any threshold has been crossed.
 * @private
 */
IntersectionObserver.prototype._hasCrossedThreshold =
    function(oldEntry, newEntry) {

  // To make comparing easier, an entry that has a ratio of 0
  // but does not actually intersect is given a value of -1
  var oldRatio = oldEntry && oldEntry.isIntersecting ?
      oldEntry.intersectionRatio || 0 : -1;
  var newRatio = newEntry.isIntersecting ?
      newEntry.intersectionRatio || 0 : -1;

  // Ignore unchanged ratios
  if (oldRatio === newRatio) return;

  for (var i = 0; i < this.thresholds.length; i++) {
    var threshold = this.thresholds[i];

    // Return true if an entry matches a threshold or if the new ratio
    // and the old ratio are on the opposite sides of a threshold.
    if (threshold == oldRatio || threshold == newRatio ||
        threshold < oldRatio !== threshold < newRatio) {
      return true;
    }
  }
};


/**
 * Returns whether or not the root element is an element and is in the DOM.
 * @return {boolean} True if the root element is an element and is in the DOM.
 * @private
 */
IntersectionObserver.prototype._rootIsInDom = function() {
  return !this.root || containsDeep(document, this.root);
};


/**
 * Returns whether or not the target element is a child of root.
 * @param {Element} target The target element to check.
 * @return {boolean} True if the target element is a child of root.
 * @private
 */
IntersectionObserver.prototype._rootContainsTarget = function(target) {
  return containsDeep(this.root || document, target);
};


/**
 * Adds the instance to the global IntersectionObserver registry if it isn't
 * already present.
 * @private
 */
IntersectionObserver.prototype._registerInstance = function() {
  if (registry.indexOf(this) < 0) {
    registry.push(this);
  }
};


/**
 * Removes the instance from the global IntersectionObserver registry.
 * @private
 */
IntersectionObserver.prototype._unregisterInstance = function() {
  var index = registry.indexOf(this);
  if (index != -1) registry.splice(index, 1);
};


/**
 * Returns the result of the performance.now() method or null in browsers
 * that don't support the API.
 * @return {number} The elapsed time since the page was requested.
 */
function now() {
  return window.performance && performance.now && performance.now();
}


/**
 * Throttles a function and delays its executiong, so it's only called at most
 * once within a given time period.
 * @param {Function} fn The function to throttle.
 * @param {number} timeout The amount of time that must pass before the
 *     function can be called again.
 * @return {Function} The throttled function.
 */
function throttle(fn, timeout) {
  var timer = null;
  return function () {
    if (!timer) {
      timer = setTimeout(function() {
        fn();
        timer = null;
      }, timeout);
    }
  };
}


/**
 * Adds an event handler to a DOM node ensuring cross-browser compatibility.
 * @param {Node} node The DOM node to add the event handler to.
 * @param {string} event The event name.
 * @param {Function} fn The event handler to add.
 * @param {boolean} opt_useCapture Optionally adds the even to the capture
 *     phase. Note: this only works in modern browsers.
 */
function addEvent(node, event, fn, opt_useCapture) {
  if (typeof node.addEventListener == 'function') {
    node.addEventListener(event, fn, opt_useCapture || false);
  }
  else if (typeof node.attachEvent == 'function') {
    node.attachEvent('on' + event, fn);
  }
}


/**
 * Removes a previously added event handler from a DOM node.
 * @param {Node} node The DOM node to remove the event handler from.
 * @param {string} event The event name.
 * @param {Function} fn The event handler to remove.
 * @param {boolean} opt_useCapture If the event handler was added with this
 *     flag set to true, it should be set to true here in order to remove it.
 */
function removeEvent(node, event, fn, opt_useCapture) {
  if (typeof node.removeEventListener == 'function') {
    node.removeEventListener(event, fn, opt_useCapture || false);
  }
  else if (typeof node.detatchEvent == 'function') {
    node.detatchEvent('on' + event, fn);
  }
}


/**
 * Returns the intersection between two rect objects.
 * @param {Object} rect1 The first rect.
 * @param {Object} rect2 The second rect.
 * @return {?Object} The intersection rect or undefined if no intersection
 *     is found.
 */
function computeRectIntersection(rect1, rect2) {
  var top = Math.max(rect1.top, rect2.top);
  var bottom = Math.min(rect1.bottom, rect2.bottom);
  var left = Math.max(rect1.left, rect2.left);
  var right = Math.min(rect1.right, rect2.right);
  var width = right - left;
  var height = bottom - top;

  return (width >= 0 && height >= 0) && {
    top: top,
    bottom: bottom,
    left: left,
    right: right,
    width: width,
    height: height
  };
}


/**
 * Shims the native getBoundingClientRect for compatibility with older IE.
 * @param {Element} el The element whose bounding rect to get.
 * @return {Object} The (possibly shimmed) rect of the element.
 */
function getBoundingClientRect(el) {
  var rect;

  try {
    rect = el.getBoundingClientRect();
  } catch (err) {
    // Ignore Windows 7 IE11 "Unspecified error"
    // https://github.com/WICG/IntersectionObserver/pull/205
  }

  if (!rect) return getEmptyRect();

  // Older IE
  if (!(rect.width && rect.height)) {
    rect = {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top
    };
  }
  return rect;
}


/**
 * Returns an empty rect object. An empty rect is returned when an element
 * is not in the DOM.
 * @return {Object} The empty rect.
 */
function getEmptyRect() {
  return {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0
  };
}

/**
 * Checks to see if a parent element contains a child elemnt (including inside
 * shadow DOM).
 * @param {Node} parent The parent element.
 * @param {Node} child The child element.
 * @return {boolean} True if the parent node contains the child node.
 */
function containsDeep(parent, child) {
  var node = child;
  while (node) {
    if (node == parent) return true;

    node = getParentNode(node);
  }
  return false;
}


/**
 * Gets the parent node of an element or its host element if the parent node
 * is a shadow root.
 * @param {Node} node The node whose parent to get.
 * @return {Node|null} The parent node or null if no parent exists.
 */
function getParentNode(node) {
  var parent = node.parentNode;

  if (parent && parent.nodeType == 11 && parent.host) {
    // If the parent is a shadow root, return the host element.
    return parent.host;
  }
  return parent;
}


// Exposes the constructors globally.
window.IntersectionObserver = IntersectionObserver;
window.IntersectionObserverEntry = IntersectionObserverEntry;

}(window, document));


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
* Configuration
*/
const config = {
  webRoot: 'https://www.uni-weimar.de/medien/webis/tmp/slides',
  itemWidth: 300,

  // How to position scrollable content
  // true:  use CSS transforms
  // false: use the views `scrollLeft`/`scrollTop` property
  moveViewItemsWithTransform: true,

  minimalDocumentHeight: true,

  // HTML classes that are used by the CSS
  class: {
    main: '.main-content',
    view: '.doc-view',
    doc:  '.doc',
    item: '.doc__page'
  },

  // Modifier key. Possible values: `ctrlKey`, `shiftKey`, `altKey`
  modifierKey: 'shiftKey'
};



/*
* Features
*/
const features = {

  core: {
    enable: function() {
      enableModalButtons();
      enableToggleButtons();
    },
    disable: function() {
      console.error('Can’t disable core feature.');
    }
  },

  wheelNavigation: {
    enable: function() {
      enableModifier();
      document.addEventListener('wheel', handleWheelNavigation, activeListener);
    },
    disable: function() {
      disableModifier();
      document.removeEventListener('wheel', handleWheelNavigation, activeListener);
    }
  },

  keyboardNavigation: {
    enable: function() {
      document.addEventListener('keydown', handleKeyboardInput, activeListener);
    },
    disable: function() {
      document.removeEventListener('keydown', handleKeyboardInput, activeListener);
    }
  },

  itemLinking: {
    enable: function() {
      document.addEventListener('keydown', handleItemLinking, passiveListener);
    },
    disable: function() {
      document.removeEventListener('keydown', handleItemLinking, passiveListener);
    }
  },

  activatingOnHover: {
    enable: function() {
      document.body.addEventListener('mousemove', activateOnHover, passiveListener);
    },
    disable: function() {
      document.body.removeEventListener('mousemove', activateOnHover, passiveListener);
    }
  }

};

const state = {
  activeView: null,
  viewObserver: null,
  visibleItems: null,
  lastFocusedElement: null
};

// Maps key codes to key names
const modifierKeyNames = Object.freeze({
  16: 'shiftKey',
  17: 'ctrlKey',
  18: 'altKey'
});

/*
* Maps key codes to key names.
* It’s used within keyboard-related event handlers in order to work with the
* keys’ names instead of key codes.
*
* Removing an entry here disables its application-related interactions
*/
const controlKeyNames = Object.freeze({
  // 9: 'tabKey',
  35: 'endKey',
  36: 'homeKey',
  37: 'arrowLeft',
  38: 'arrowUp',
  39: 'arrowRight',
  40: 'arrowDown'
});

/*
* Maps control keys to a trigger function that is executed when the key is
* pressed.
*/
const controlKey = Object.freeze({
  homeKey: {
    direction: -1,
    trigger: function() {
      // setViewPos(state.activeView, 0)
      moveItem(this.direction * getItemCount(state.activeView));
    }
  },
  endKey: {
    direction: 1,
    trigger: function() {
      // setViewPos(state.activeView, getLastItemIndex())
      moveItem(this.direction * getItemCount(state.activeView));
    }
  },
  arrowLeft: {
    direction: -1,
    trigger: function(event) {
      moveItem(this.direction * (event.ctrlKey ? 3 : 1));
    }
  },
  arrowRight: {
    direction: 1,
    trigger: function(event) {
      moveItem(this.direction * (event.ctrlKey ? 3 : 1));
    }
  },
  arrowUp: {
    trigger: function() {
      goToPreviousView();
    }
  },
  arrowDown: {
    trigger: function() {
      goToNextView();
    }
  },
  tabKey: {
    trigger: function(event) {
      if (event.shiftKey) {
        goToPreviousView();
      } else {
        goToNextView();
      }
    }
  }
});

module.exports = function () {
  initializeLazyLoader();

  document.addEventListener('DOMContentLoaded', function() {
    loadDocumentAsync()
      .then(onFirstDocumentLoaded, onDocumentReject)
      .catch(message => { console.error(message) });

    Object.values(features).forEach(feature => feature.enable());
  });
};





////////////////////////////////////////////////////////////////////////////////////////////////////
// LOADING DOCUMENTS

function loadDocumentAsync() {
  return new Promise((resolve, reject) => {
    const mainContent = document.querySelector(config.class.main)
    const docData = documentsData[0]

    if (docData === undefined) {
      reject('No more documents to load.')
    }

    loadDoc(mainContent, docData)
    const view = mainContent.lastElementChild
    state.viewObserver.observe(view)
    setDocumentWidth(view.querySelector(config.class.doc))
    enableDocumentScrolling(view)
    // activateViewOnHover(view)
    // activateItemsOnHover(view)
    resolve()
  })
}

function loadDoc(mainContent, docData) {
  const viewTemplate = document.createElement('template')
  viewTemplate.innerHTML = createDocumentMarkup(docData[0], docData[1])
  mainContent.appendChild(viewTemplate.content)
}

/*
* Creates the full markup of one document
*/
function createDocumentMarkup(docName, itemCount) {
  const assetPath = `${config.webRoot}/data`
  let items = ''
  for (var i = 0; i < itemCount; i++) {
    const source = `${assetPath}/${docName}-${i}.png`
    items += `<div class="${config.class.item.slice(1)}" data-page="${i + 1}">
      <img data-src="${source}" alt="page ${i + 1}">
    </div>`
  }

  const docSource = `${assetPath}/${docName}`

  return `
  <div
    class="${config.class.view.slice(1)}"
    id="${docName}"
    data-doc-source="${docSource}"
    data-page-count="${itemCount + 1}">
    <div class="${config.class.doc.slice(1)}">
      <div class="${config.class.item.slice(1)} doc-info active" data-page="0">
        <h2 class="doc-title">
          <a href="${docSource}">${docName}</a>
        </h2>
        by <span class="doc-author">author</span>,
        <span class="doc-pages-count">${itemCount}</span> pages,
        2018
      </div>
      ${items}
    </div>
  </div>`
}

function setDocumentWidth(doc) {
  const documentOuterWidth =
    getFloatPropertyValue(doc, 'margin-left') +
    getFloatPropertyValue(doc, 'border-left-width') +
    getComputedOuterChildrenWidth(doc) +
    getFloatPropertyValue(doc, 'border-right-width') +
    getFloatPropertyValue(doc, 'margin-right')
  doc.style.setProperty('width', documentOuterWidth + 'px')
}

function enableDocumentScrolling(view) {
  let prevX
  let touched = false
  let transitionValue
  let doc

  view.addEventListener('touchstart', function(event) {
    if (config.moveViewItemsWithTransform) {
      view.style.setProperty('will-change', 'transform')
    }

    touched = true
    doc = view.querySelector(config.class.doc)
    transitionValue = getComputedStyle(doc).getPropertyValue('transition')
    doc.style.setProperty('transition', 'none')

    prevX = event.targetTouches[0].clientX
  }, supportsPassive ? { passive: true }: false)

  view.addEventListener('touchmove', function(event) {
    if (touched) {
      const currentX = event.targetTouches[0].clientX
      const offset = currentX - prevX
      const newItemX = getViewPixelPos(view) - offset
      const disableTransition = true
      setViewPixelPos(view, newItemX, disableTransition)
      prevX = currentX
    }
  }, supportsPassive ? { passive: true }: false)

  view.addEventListener('touchend', function(event) {
    if (touched) {
      const newPos = getViewPos(view)
      setViewPos(view, Math.round(newPos))

      if (config.moveViewItemsWithTransform) {
        view.style.setProperty('will-change', 'auto')
      }

      touched = false
      doc.style.setProperty('transition', transitionValue)
    }
  }, supportsPassive ? { passive: true }: false)
}

function activateViewOnHover(view) {
  view.addEventListener('mouseover', event => {
    setActiveView(event.currentTarget)
  })
}

function activateItemsOnHover(view) {
  const items = Array.from(view.querySelectorAll(config.class.item))
  items.forEach(item => item.addEventListener('mouseenter', event => {
    const view = event.currentTarget.closest(config.class.view)
    setActiveItem(view, event.currentTarget)
  }))
}

function onFirstDocumentLoaded() {
  const firstView = document.querySelector(config.class.view)
  setActiveView(firstView)

  evaluateItemWidth()
  setFullyVisibleItems()
  onDocumentLoaded()
}

function onDocumentLoaded() {
  documentsData.shift() // Delete first element
  console.info('Document loaded. Remaining:', documentsData.length)
  loadDocumentAsync()
    .then(onDocumentLoaded, onDocumentReject)
    .catch(message => { console.log(message) })
}

function onDocumentReject(message) {
  console.info(message)
}

function evaluateItemWidth() {
  const itemSample = document.querySelector(config.class.item)
  const itemOuterWidth = getOuterWidth(itemSample)
  // const itemOuterWidth = Math.ceil(getOuterWidth(itemSample))

  if (itemOuterWidth !== config.itemWidth) {
    console.info(
      'Pre-configured page width does not match actual page width.',
      'Updating configuration.'
    )
    config.itemWidth = itemOuterWidth
  }
}

function setFullyVisibleItems() {
  state.visibleItems = getFullyVisibleItems()
}

function getFullyVisibleItems() {
  const itemSample = document.querySelector(config.class.item)
  const itemOuterWidth = getOuterWidth(itemSample)

  const viewSample = document.querySelector(config.class.view)
  const viewWidth = getFloatPropertyValue(viewSample, 'width')
  return Math.floor(viewWidth / itemOuterWidth)
}





////////////////////////////////////////////////////////////////////////////////////////////////////
// NAVIGATION

function handleKeyboardInput(event) {
  if (event.keyCode in controlKeyNames) {
    event.preventDefault()
    const keyName = controlKeyNames[event.keyCode]
    controlKey[keyName].trigger(event)
  }
}

function activateOnHover(event) {
  const view = event.target.closest(config.class.view)
  const item = event.target.closest(config.class.item)

  if (view === null || item === null) {
    return
  }

  setActiveView(view)
  setActiveItem(view, item)
}





/*
* Item Linking.
*
* Open an items’ source document (e.g. a PDF page) by pressing <kbd>Return</kbd>.
*/
function handleItemLinking(event) {
  if (event.keyCode !== 13) {
    return
  }

  // Focusable elements have a default behavior (e.g. activating a link)
  // That behavior shall not be altered/extended.
  if (isInteractive(event.target)) {
    return
  }

  if (state.activeView !== null) {
    openItem(state.activeView, event.ctrlKey)
  }
}

function openItem(view, ctrlKey) {
  const docSource = view.getAttribute('data-doc-source')
  const itemIndex = getActiveItem(view).getAttribute('data-page')
  const fragment = itemIndex !== '0' ? `#page=${itemIndex}` : ''
  const itemSource = docSource + fragment

  if (ctrlKey) {
    window.open(itemSource)
  } else {
    window.location.href = itemSource
  }
}





/*
* Modifier keys.
*/
function enableModifier() {
  const modifier = config.modifierKey.replace('Key', '');
  const modifierElements = Array.from(document.querySelectorAll('.shortcut__modifier'));
  modifierElements.forEach(element => element.innerText = modifier);

  document.addEventListener('keydown', onModifierDown, passiveListener);
  document.addEventListener('keyup', onModifierUp, passiveListener);
  window.addEventListener('blur', onModifierBlur, passiveListener);
}

function disableModifier() {
  document.removeEventListener('keydown', onModifierDown, passiveListener);
  document.removeEventListener('keyup', onModifierUp, passiveListener);
  window.removeEventListener('blur', onModifierBlur, passiveListener);
}

function onModifierDown(event) {
  const modifierKey = modifierKeyNames[event.keyCode]
  if (modifierKey === config.modifierKey) {
    const doc = state.activeView.querySelector(config.class.doc)
    doc.style.setProperty('cursor', 'ew-resize')
  }
}

function onModifierUp(event) {
  const modifierKey = modifierKeyNames[event.keyCode]
  if (modifierKey === config.modifierKey) {
    const doc = state.activeView.querySelector(config.class.doc)
    doc.style.setProperty('cursor', 'auto')
  }
}

function onModifierBlur() {
  const doc = state.activeView.querySelector(config.class.doc)
  doc.style.setProperty('cursor', 'auto')
}




/*
* Mouse wheel item navigation
*/
function handleWheelNavigation(event) {
  // No special scrolling without modifier
  if (event[config.modifierKey] === false) {
    return
  }

  // No special scrolling when not scrolling vertically
  if (event.deltaY === 0) {
    return
  }

  const view = event.target.closest(config.class.view)
  if (view === null) {
    return
  }

  // Prevent vertical scrolling
  event.preventDefault()

  // Prevent unnecessary actions when there is nothing to scroll
  const numItems = view.querySelector(config.class.doc).childElementCount
  if (numItems <= state.visibleItems) {
    return
  }

  moveView(Math.sign(event.deltaY))
}

function moveView(distance) {
  const view = state.activeView
  if (view === null) {
    return
  }

  // Move items along with view
  // moveItem(distance)

  let currentViewPos = getViewPos(view)
  // if (isNotAligned(currentViewPos)) {
  //   currentViewPos = Math.round(currentViewPos)
  // }
  setViewPos(view, currentViewPos + distance)
}

function isNotAligned(itemsBeforeView) {
  return itemsBeforeView % 1 !== 0
}

function moveItem(distance) {
  const view = state.activeView
  const item = getActiveItem(view)
  const currentIndex = parseInt(item.getAttribute('data-page'))
  const lastIndex = getItemCount(view) - 1
  const targetIndex = clamp(currentIndex + distance, 0, lastIndex)
  const targetItem = getItemByIndex(view, targetIndex)
  setActiveItem(view, targetItem)

  // Move view if item would become partially hidden
  const targetRect = targetItem.getBoundingClientRect()
  const viewRect = view.getBoundingClientRect()
  const marginLeft = getFloatPropertyValue(targetItem, 'margin-left')
  const marginRight = getFloatPropertyValue(targetItem, 'margin-right')
  const isFullyVisible = (
    targetRect.left >= viewRect.left &&
    (targetRect.right + marginLeft + marginRight) <= (viewRect.left + viewRect.width)
  )
  const actualDistance = targetIndex - currentIndex
  if (isFullyVisible === false) {
    moveView(actualDistance)
    return
  }

  // Move view if it’s not aligned
  // let currentViewPos = getViewPos(view)
  // if (isNotAligned(currentViewPos) && Math.sign(distance) < 0) {
  //   setViewPos(view, Math.floor(currentViewPos))
  // }
}

function getViewPos(view) {
  return getViewPixelPos(view) / config.itemWidth
}

function getViewPixelPos(view) {
  if (config.moveViewItemsWithTransform) {
    const doc = view.querySelector(config.class.doc)
    // Negate the value in order to match scrollbar position values
    const itemPos = -1 * getTranslateX(doc)
    return itemPos
  }

  return view.scrollLeft
}

function setViewPos(view, itemPos) {
  if (view === null) {
    return
  }

  const doc = view.querySelector(config.class.doc)
  const maxPos = getItemCount(view) - state.visibleItems
  itemPos = clamp(itemPos, 0, maxPos)
  // if (itemPos < 0) {
  //   itemPos = 0
  // }
  // else if (itemPos > maxPos) {
  //   itemPos = maxPos
  // }

  let itemX = itemPos * config.itemWidth
  // const maxX = getOuterWidth(doc) - getOuterWidth(view)
  // if (itemX > maxX) {
  //   itemX = maxX
  // }

  setViewPixelPos(view, itemX)
}

function setViewPixelPos(view, itemX, disableTransition = false) {
  const doc = view.querySelector(config.class.doc)

  if (config.moveViewItemsWithTransform) {
    doc.style.setProperty('transform', `translateX(${-itemX}px)`)
  } else {
    view.scrollLeft = itemX
  }
}

function getTranslateX(element) {
  const matrix = getComputedStyle(element).getPropertyValue('transform')

  if (matrix === 'none') {
    return 0
  }

  return parseFloat(matrix.split(',')[4])
}

function goToPreviousView() {
  const target = state.activeView.previousElementSibling
  if (target !== null) {
    setActiveView(target)
  }
}

function goToNextView() {
  const target = state.activeView.nextElementSibling
  if (target !== null) {
    setActiveView(target)
  }
}

function getLastItemIndex() {
  const doc = state.activeView.querySelector(config.class.doc)
  return doc.childElementCount - 1
}

function setActiveView(view) {
  const views = document.querySelectorAll(`${config.class.view}.active`)
  Array.from(views).forEach(element => element.classList.remove('active'))
  state.activeView = view
  state.activeView.classList.add('active')
  document.activeElement.blur()
}

function getItemCount(view) {
  return parseInt(view.getAttribute('data-page-count'))
}

function getActiveItem(view) {
  return view.querySelector(`${config.class.item}.active`)
}

function setActiveItem(view, targetItem) {
  const activeItem = getActiveItem(view)
  activeItem.classList.remove('active')
  targetItem.classList.add('active')
  document.activeElement.blur()
}

function getItemByIndex(view, index) {
  const doc = view.querySelector(config.class.doc)
  return doc.children[index]
}





/*
* Modal window
*
* Based on ideas from “The Incredible Accessible Modal Window” by Greg Kraus
* https://github.com/gdkraus/accessible-modal-dialog
*/
function enableModalButtons() {
  Array.from(document.querySelectorAll('.open-modal')).forEach(button => {
    button.removeAttribute('disabled')
    button.addEventListener('click', openModal)
  })

  Array.from(document.querySelectorAll('.close-modal')).forEach(button => {
    button.addEventListener('click', closeModal)
  })
}

function openModal(event) {
  const targetClass = event.currentTarget.getAttribute('data-target-modal')
  const modal = document.querySelector(`.${targetClass}`)

  if (modal === null) {
    return
  }

  // Save last focused element
  state.lastFocusedElement = document.activeElement

  document.body.setAttribute('aria-hidden', 'true')
  modal.setAttribute('aria-hidden', 'false')

  modal.classList.remove('closed')

  getFocusableElements(modal)[0].focus()

  // Setup event listeners
  modal.addEventListener('keydown', closeModalOnEscape, passiveListener)
  modal.addEventListener('keydown', trapTabKey, activeListener)
  modal.addEventListener('click', closeModalOnBackground, passiveListener)
}

function closeModal(event) {
  const modal = event.target.closest('.modal')

  if (modal === null) {
    return
  }

  document.body.setAttribute('aria-hidden', 'false')
  modal.setAttribute('aria-hidden', 'true')

  modal.classList.add('closed')

  // Clean up event listeners
  modal.removeEventListener('keydown', closeModalOnEscape, passiveListener)
  modal.removeEventListener('keydown', trapTabKey, activeListener)
  modal.removeEventListener('click', closeModalOnBackground, passiveListener)

  // Restore previously focused element
  state.lastFocusedElement.focus()
}

function closeModalOnBackground(event) {
  if (event.target === event.currentTarget) {
    closeModal(event)
  }
}

function closeModalOnEscape(event) {
  if (event.keyCode === 27) {
    closeModal(event)
  }
}

/*
* Make it impossible to focus an element outside the modal
*/
function trapTabKey(event) {
  if (event.keyCode !== 9) {
    return
  }

  const activeElement = document.activeElement
  const focusable = getFocusableElements(event.currentTarget)
  const tabbable = focusable.filter(element => element.tabIndex > -1);

  if (tabbable.length < 2) {
    event.preventDefault()
    return
  }

  if (event.shiftKey) {
    if (activeElement === tabbable[0]) {
      tabbable[tabbable.length - 1].focus()
      event.preventDefault()
    }
  } else {
    if (activeElement === tabbable[tabbable.length - 1]) {
      tabbable[0].focus()
      event.preventDefault()
    }
  }
}

const focusableElementsSelector = `
  a[href],
  area[href],
  input:not([disabled]),
  select:not([disabled]),
  textarea:not([disabled]),
  button:not([disabled]),
  iframe,
  object,
  embed,
  [tabindex],
  [contenteditable=true]
`;

function getFocusableElements(ancestor = document) {
  return Array.from(ancestor.querySelectorAll(focusableElementsSelector));
}

function isInteractive(element) {
  const tag = element.tagName.toLowerCase();
  let potentiallyInteractive = false;
  switch (true) {
    case ['a', 'area'].includes(tag):
      if (element.hasAttribute('href') === false) {
        return false;
      }
      potentiallyInteractive = true;
      break;
    case ['input', 'select', 'textarea', 'button'].includes(tag):
      if (element.disabled) {
        return false;
      }
      potentiallyInteractive = true;
      break;
    case ['iframe', 'object', 'embed'].includes(tag):
      potentiallyInteractive = true;
      break;
    default:
      if (element.getAttribute('contenteditable') === 'true') {
        potentiallyInteractive = true;
      }
      break;
  }

  if (potentiallyInteractive && element.offsetParent !== null) {
    return true;
  }

  return false;
}





/*
* Toggle Buttons
*/
function enableToggleButtons() {
  const switches = Array.from(document.querySelectorAll('.switch'));
  switches.forEach(switchButton => {
    switchButton.addEventListener('click', event => {
      const button = event.currentTarget;
      const isChecked = button.getAttribute('aria-checked') === 'true';
      const feature = features[button.getAttribute('data-feature')];
      if (isChecked) {
        feature.disable();
      } else {
        feature.enable();
      }
      button.setAttribute('aria-checked', String(!isChecked))
    });
  });
}



////////////////////////////////////////////////////////////////////////////////////////////////////
// LAZY LOADING PAGES

/*
* Observes document views in order to load their item images only when
* they’re visible.
*/
function initializeLazyLoader() {
  const options = {
    rootMargin: `500px 0px`
  }

  state.viewObserver = new IntersectionObserver(viewObservationHandler, options)
}

function viewObservationHandler(entries, observer) {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const view = entry.target
      const images = Array.from(view.querySelectorAll('img[data-src]'))
      // For each image …
      images.forEach(img => {
        // … swap out the `data-src` attribute with the `src` attribute.
        // This will start loading the images.
        if (img.hasAttribute('data-src')) {
          img.setAttribute('src', img.getAttribute('data-src'))
          img.removeAttribute('data-src')
        }
      })

      images[0].addEventListener('load', function() {
        handleFirstItemImageLoaded(entry.target)
      })

      // Unobserve the current target because no further action is required
      observer.unobserve(entry.target)
    }
  }
}

function handleFirstItemImageLoaded(view) {
  if (config.minimalDocumentHeight) {
    setItemAspectRatio(view)
  }
}

function setItemAspectRatio(view) {
  const imgSample = view.querySelector(`${config.class.item} > img`)
  const aspectRatio = imgSample.naturalWidth / imgSample.naturalHeight
  view.style.setProperty('--page-aspect-ratio', aspectRatio)
}





////////////////////////////////////////////////////////////////////////////////////////////////////
// MISC

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

/*
* https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
*/
let supportsPassive = false
try {
  const opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true
    }
  });
  window.addEventListener('test', null, opts)
} catch (event) {}

const activeListener = supportsPassive ? { passive: false } : false
const passiveListener = supportsPassive ? { passive: true } : false


function getFloatPropertyValue(element, property) {
  const value = getComputedStyle(element).getPropertyValue(property)

  if (value === '') {
    return 0
  }

  return parseFloat(value)
}

/*
* Computes the total outer width of an element by accumulating its children’s
* horizontal dimension property values (i.e. margin-left, width, margin-right)
*/
function getComputedOuterChildrenWidth(element) {
  let outerWidth = 0

  Array.from(element.children).forEach(child => {
    outerWidth += getOuterWidth(child)
  })

  return outerWidth
}

/*
* Computes the total outer width of an element.
* The outer width is defined as the width plus any horizontal margins.
* This is assumes the the `box-sizing` box model.
*/
function getOuterWidth(element) {
  const width = getFloatPropertyValue(element, 'width')
  const marginLeft = getFloatPropertyValue(element, 'margin-left')
  const marginRight = getFloatPropertyValue(element, 'margin-right')

  return marginLeft + width + marginRight
}


/***/ }),
/* 3 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
/******/ ]);